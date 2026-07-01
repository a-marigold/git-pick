const std = @import("std");

const qjs = @import("quickjs.zig");

const constants = @import("constants.zig");

const allocator = std.heap.smp_allocator;

var threaded: std.Io.Threaded = undefined;
var io: std.Io = undefined;
var cwd: std.Io.Dir = undefined;

fn exec(
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
        const argValue = qjs.JS_GetPropertyUint32(ctx, cmd, cmdIndex);
        defer qjs.JS_FreeValue_wrapper(ctx, argValue);

        const argString = qjs.JS_ToCStringLen2(ctx, null, argValue, 0) orelse {
            return qjs.JS_NULL;
        };

        qjsStrings.append(allocator, argString) catch {
            return qjs.JS_NULL;
        };

        zigCmd.append(allocator, std.mem.span(argString)) catch {
            return qjs.JS_NULL;
        };
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

    const execResult = qjs.JS_NewObject(ctx);

    _ = qjs.JS_SetPropertyStr(ctx, execResult, "stdout", qjs.JS_NewStringLen(ctx, result.stdout.ptr, result.stdout.len));
    _ = qjs.JS_SetPropertyStr(ctx, execResult, "stderr", qjs.JS_NewStringLen(ctx, result.stderr.ptr, result.stderr.len));

    return execResult;
}

fn readFileSync(
    ctx: *qjs.JSContext,
    thisVal: qjs.JSValueConst,
    argc: c_int,
    argv: [*c]qjs.JSValueConst,
) callconv(.c) qjs.JSValue {
    _ = thisVal;
    if (argc < 1) {
        return qjs.JS_NULL;
    }

    const filePathString = qjs.JS_ToCStringLen2(
        ctx,
        null,
        argv[0],
        0,
    ) orelse {
        return qjs.JS_NULL;
    };

    defer qjs.JS_FreeCString(ctx, filePathString);

    const file = cwd.readFileAlloc(io, std.mem.span(filePathString), allocator, .limited(constants.GB)) catch {
        return qjs.JS_NULL;
    };

    defer allocator.free(file);
    return qjs.JS_NewStringLen(ctx, file.ptr, file.len);
}

fn writeFileSync(
    ctx: *qjs.JSContext,
    thisVal: qjs.JSValueConst,
    argc: c_int,
    argv: [*c]qjs.JSValueConst,
) callconv(.c) qjs.JSValue {
    _ = thisVal;

    if (argc < 2) {
        return qjs.JS_NULL;
    }

    const filePathString = qjs.JS_ToCStringLen2(ctx, null, argv[0], 0) orelse {
        return qjs.JS_NULL;
    };
    defer qjs.JS_FreeCString(ctx, filePathString);

    const data = qjs.JS_ToCStringLen2(ctx, null, argv[1], 0) orelse {
        return qjs.JS_NULL;
    };
    defer qjs.JS_FreeCString(ctx, data);

    cwd.writeFile(io, .{
        .sub_path = std.mem.span(filePathString),

        .data = std.mem.span(data),
    }) catch {
        return qjs.JS_NULL;
    };

    return qjs.JS_UNDEFINED;
}

fn gpickOsInit(ctx: *qjs.JSContext, module: *qjs.JSModuleDef) callconv(.c) c_int {
    _ = qjs.JS_SetModuleExport(
        ctx,
        module,
        "exec",
        qjs.JS_NewCFunction2(
            ctx,
            exec,
            "exec",
            1,
            .JS_CFUNC_generic,
            0,
        ),
    );

    _ = qjs.JS_SetModuleExport(
        ctx,
        module,
        "readFileSync",
        qjs.JS_NewCFunction2(
            ctx,
            readFileSync,
            "readFileSync",
            1,
            .JS_CFUNC_generic,
            0,
        ),
    );

    _ = qjs.JS_SetModuleExport(
        ctx,
        module,
        "writeFileSync",
        qjs.JS_NewCFunction2(
            ctx,
            writeFileSync,
            "writeFileSync",
            1,
            .JS_CFUNC_generic,
            0,
        ),
    );

    return 0;
}

export fn initGpickOsModule(ctx: *qjs.JSContext, module_name: [*c]const u8) callconv(.c) ?*qjs.JSModuleDef {
    threaded = .init(allocator, .{});
    defer threaded.deinit();

    io = threaded.io();

    cwd = .cwd();

    const module = qjs.JS_NewCModule(ctx, module_name, gpickOsInit);

    if (module == null) {
        return null;
    }

    _ = qjs.JS_AddModuleExport(ctx, module, "exec");

    _ = qjs.JS_AddModuleExport(ctx, module, "readFileSync");

    return module;
}
