const std = @import("std");

const qjs = @import("quickjs.zig");

const allocator = std.heap.smp_allocator;

var threaded: std.Io.Threaded = undefined;
var io: std.Io = undefined;

// 'gpick-os' module

fn gpickOsExec(
    ctx: ?*qjs.JSContext,
    thisVal: qjs.JSValueConst,
    argc: c_int,
    argv: [*c]qjs.JSValueConst,
) callconv(.c) qjs.JSValue {
    _ = thisVal;

    if (argc < 1 or qjs.JS_IsArray(ctx, argv[0]) == 0) {
        return qjs.JS_NULL;
    }

    const lenVal = qjs.JS_GetPropertyStr(ctx, argv[0], "length");
    defer qjs.JS_FreeValue(ctx, lenVal);

    var jsArgc: u32 = 0;

    _ = qjs.JS_ToUint32(ctx, &jsArgc, lenVal);

    if (jsArgc < 1) {
        return qjs.JS_NULL;
    }

    var argvList = std.ArrayList([]const u8).empty;
    defer argvList.deinit(allocator);

    var qjsStrings = std.ArrayList([*c]const u8).empty;
    defer {
        for (qjsStrings.items) |str| {
            qjs.JS_FreeCString(ctx, str);
        }

        qjsStrings.deinit(allocator);
    }

    var i: u32 = 0;
    while (i < jsArgc) : (i += 1) {
        const argVal = qjs.JS_GetPropertyUint32(ctx, argv[0], i);

        defer qjs.JS_FreeValue(ctx, argVal);

        const argStr = qjs.JS_ToCString(ctx, argVal);
        if (argStr != null) {
            qjsStrings.append(allocator, argStr) catch return qjs.JS_NULL;

            const zigStr = std.mem.span(argStr);

            argvList.append(allocator, zigStr) catch return qjs.JS_NULL;
        }
    }

    const result = std.process.run(allocator, io, .{
        .argv = argvList.items,
    }) catch {
        return qjs.JS_NULL;
    };
    defer {
        allocator.free(result.stdout);
        allocator.free(result.stderr);
    }

    const resObj = qjs.JS_NewObject(ctx);

    _ = qjs.JS_SetPropertyStr(ctx, resObj, "stdout", qjs.JS_NewStringLen(ctx, result.stdout.ptr, result.stdout.len));
    _ = qjs.JS_SetPropertyStr(ctx, resObj, "stderr", qjs.JS_NewStringLen(ctx, result.stderr.ptr, result.stderr.len));

    return resObj;
}

const gpickOsFuncs = [_]qjs.JSCFunctionListEntry{
    .{
        .name = "exec",
        .prop_flags = qjs.JS_PROP_WRITABLE | qjs.JS_PROP_CONFIGURABLE,

        .def_type = qjs.JS_DEF_CFUNC,
        .magic = 0,
        .u = .{
            .func = .{
                .length = 2,
                .cproto = qjs.JS_CFUNC_generic,
                .cfunc = .{ .generic = gpickOsExec },
            },
        },
    },
};

fn gpickOsInit(ctx: ?*qjs.JSContext, m: ?*qjs.JSModuleDef) callconv(.c) c_int {
    return qjs.JS_SetModuleExportList(
        ctx,
        m,
        &gpickOsFuncs,
        gpickOsFuncs.len,
    );
}

export fn initGpickOsModule(ctx: ?*qjs.JSContext, module_name: [*c]const u8) callconv(.c) ?*qjs.JSModuleDef {
    threaded = .init(allocator, .{});
    defer threaded.deinit();

    io = threaded.io();

    const m = qjs.JS_NewCModule(ctx, module_name, gpickOsInit);

    if (m == null) return null;

    _ = qjs.JS_AddModuleExportList(ctx, m, &gpickOsFuncs, gpickOsFuncs.len);

    return m;
}
