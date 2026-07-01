pub const JSContext = opaque {};
pub const JSModuleDef = opaque {};
pub const JSValue = extern struct {
    u: extern union {
        int32: i32,
        float64: f64,
        ptr: ?*anyopaque,
    },
    tag: i64,
};
pub const JSValueConst = JSValue;
pub const JSCFunction = *const fn (
    ctx: *JSContext,
    this_val: JSValueConst,
    argc: c_int,
    argv: [*c]JSValueConst,
) callconv(.c) JSValue;

pub const JSCFunctionListEntry = extern struct {
    name: [*c]const u8,
    prop_flags: u8,
    def_type: u8,
    magic: i16,

    u: extern union {
        func: extern struct {
            length: u8,
            cproto: u8,
            cfunc: extern union {
                generic: JSCFunction,
            },
        },
    },
};

pub const JS_PROP_WRITABLE: u8 = (1 << 0);
pub const JS_PROP_CONFIGURABLE: u8 = (1 << 1);
pub const JS_DEF_ITEMS: u8 = 0;
pub const JS_DEF_CFUNC: u8 = 1;

pub const JSCFunctionEnum = enum(u8) {
    JS_CFUNC_generic,
    JS_CFUNC_generic_magic,
    JS_CFUNC_constructor,
    JS_CFUNC_constructor_magic,
    JS_CFUNC_constructor_or_func,
    JS_CFUNC_constructor_or_func_magic,
    JS_CFUNC_f_f,
    JS_CFUNC_f_f_f,
    JS_CFUNC_getter,
    JS_CFUNC_setter,
    JS_CFUNC_getter_magic,
    JS_CFUNC_setter_magic,
    JS_CFUNC_iterator_next,
};

pub const JS_TAG_NULL: i64 = -2;

pub const JS_NULL = JSValue{
    .u = .{ .int32 = 0 },

    .tag = JS_TAG_NULL,
};

pub extern "c" fn JS_IsArray(ctx: *JSContext, val: JSValueConst) callconv(.c) c_int;
pub extern "c" fn JS_GetPropertyStr(ctx: *JSContext, this_val: JSValueConst, prop: [*c]const u8) JSValue;
pub extern "c" fn JS_FreeCString(ctx: *JSContext, ptr: [*c]const u8) void;
pub extern "c" fn JS_GetPropertyUint32(ctx: *JSContext, val: JSValueConst, idx: u32) JSValue;
pub extern "c" fn JS_NewObject(ctx: *JSContext) JSValue;
pub extern "c" fn JS_NewStringLen(ctx: *JSContext, str: [*c]const u8, len: usize) JSValue;
pub extern "c" fn JS_SetPropertyStr(ctx: *JSContext, this_val: JSValueConst, prop: [*c]const u8, val: JSValue) c_int;

pub extern "c" fn JS_NewCFunction2(ctx: *JSContext, func: *JSCFunction, name: [*c]const u8, length: c_int, cproto: JSCFunctionEnum, magic: c_int) JSValue;

pub extern "c" fn JS_NewCModule(ctx: *JSContext, name_str: [*c]const u8, init_func: *const fn (ctx: *JSContext, m: *JSModuleDef) callconv(.c) c_int) *JSModuleDef;
pub extern "c" fn JS_SetModuleExport(ctx: *JSContext, m: *JSModuleDef, export_name: [*c]u8, val: JSValue) c_int;
pub extern "c" fn JS_AddModuleExport(ctx: *JSContext, m: *JSModuleDef, name_str: [*c]const u8) c_int;

pub extern "c" fn JS_ToUint32_wrapper(ctx: *JSContext, pres: *u32, val: JSValueConst) c_int;
pub extern "c" fn JS_ToCString_wrapper(ctx: *JSContext, val: JSValueConst) [*c]const u8;
pub extern "c" fn JS_FreeValue_wrapper(ctx: *JSContext, v: JSValue) void;
