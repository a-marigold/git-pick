// wrappers over `static inline` quickjs functions
// 'cause they can't be used in zig 

#include "../quickjs/quickjs.h"

int JS_ToUint32_wrapper(JSContext *ctx, uint32_t *pres, JSValueConst val) {
    return JS_ToUint32(ctx, pres, val);
}

const char *JS_ToCString_wrapper(JSContext *ctx, JSValueConst val1) {
    return JS_ToCString(ctx, val1);
}



void JS_FreeValue_wrapper(JSContext *ctx, JSValue v) {
    JS_FreeValue(ctx, v);
}
