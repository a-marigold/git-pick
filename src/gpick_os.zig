const std = @import("std");

const qjs = @import("quickjs.zig");

const allocator = std.heap.smp_allocator;

var threaded: std.Io.Threaded = undefined;
var io: std.Io = undefined;

fn gpickOsExec(
    ctx: *qjs.JSContext,
    thisVal: qjs.JSValueConst,
    argc: c_int,
    argv: [*c]qjs.JSValueConst,
) callconv(.c) qjs.JSValue {
    _ = thisVal;

    if (argc < 1) {
        return qjs.JS_NULL;
    }
    const cmd = argv[0];

    if (qjs.JS_IsArray(ctx, cmd) == 0) {
        return qjs.JS_NULL;
    }

    const cmdLengthJsValue = qjs.JS_GetPropertyStr(ctx, cmd, "length");
    defer qjs.JS_FreeValue_wrapper(ctx, cmdLengthJsValue);

    var cmdLength: u32 = 0;

    _ = qjs.JS_ToUint32_wrapper(ctx, &cmdLength, cmdLengthJsValue);

    if (cmdLength < 1) {
        return qjs.JS_NULL;
    }

    var zigCmd = std.ArrayList([]const u8).empty;
    defer zigCmd.deinit(allocator);

    var qjsStrings = std.ArrayList([*c]const u8).empty;
    defer {
        for (qjsStrings.items) |str| {
            qjs.JS_FreeCString(ctx, str);
        }

        qjsStrings.deinit(allocator);
    }

    var cmdIndex: u32 = 0;

    while (cmdIndex < cmdLength) : (cmdIndex += 1) {
        const argVal = qjs.JS_GetPropertyUint32(ctx, cmd, cmdIndex);
        defer qjs.JS_FreeValue_wrapper(ctx, argVal);

        const argStr = qjs.JS_ToCString_wrapper(ctx, argVal);
        if (argStr != null) {
            qjsStrings.append(allocator, argStr) catch {
                return qjs.JS_NULL;
            };

            zigCmd.append(allocator, std.mem.span(argStr)) catch {
                return qjs.JS_NULL;
            };
        } else {
            return qjs.JS_NULL;
        }
    }

    const result = std.process.run(allocator, io, .{
        .argv = zigCmd.items,
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

fn gpickOsInit(ctx: *qjs.JSContext, m: *qjs.JSModuleDef) callconv(.c) c_int {
    _ = qjs.JS_SetModuleExport(ctx, m, "exec", qjs.JS_NewCFunction2(
        ctx,
        gpickOsExec,
        "exec",
        1,
        .JS_CFUNC_generic,
        0,
    ));
}

export fn initGpickOsModule(ctx: *qjs.JSContext, module_name: [*c]const u8) callconv(.c) ?*qjs.JSModuleDef {
    threaded = .init(allocator, .{});
    defer threaded.deinit();
    io = threaded.io();

    const m = qjs.JS_NewCModule(ctx, module_name, gpickOsInit);

    _ = qjs.JS_AddModuleExport(ctx, m, "exec");
    return m;
}
