// `qjsc` for byte-code building from package.json must be run before

Bun.file('./dist/byteCode.c')
	.text()

	.then((byteCode) => {
		Bun.write(
			'./dist/main.c',

			'#include "../src/gpick-os.h"\n#include "../src/quickjs-libc.h"\n#define __STDC_FORMAT_MACROS 1\n' +
				byteCode +
				`
static JSContext *JS_NewCustomContext(JSRuntime *rt){
JSContext *ctx = JS_NewContextRaw(rt);
if (!ctx) return NULL;
JS_AddIntrinsicBaseObjects(ctx);
JS_AddIntrinsicDate(ctx);
JS_AddIntrinsicEval(ctx);
JS_AddIntrinsicStringNormalize(ctx);
JS_AddIntrinsicRegExp(ctx);
JS_AddIntrinsicJSON(ctx);
JS_AddIntrinsicProxy(ctx);
JS_AddIntrinsicMapSet(ctx);
JS_AddIntrinsicTypedArrays(ctx);
JS_AddIntrinsicPromise(ctx);
JS_AddIntrinsicWeakRef(ctx);
return ctx;
}
int main(int argc, char **argv){
JSRuntime *rt;
JSContext *ctx;
rt = JS_NewRuntime();
js_std_set_worker_new_context_func(JS_NewCustomContext);
js_std_init_handlers(rt);
JS_SetModuleLoaderFunc2(rt, NULL, js_module_loader, js_module_check_attributes, NULL);
ctx = JS_NewCustomContext(rt);
js_std_add_helpers(ctx, argc, argv);

init_gpick_os_module(ctx, "os_ext"); // 'gpick-os' module

js_std_eval_binary(ctx, qjsc_index, qjsc_index_size, 0);
js_std_loop(ctx);
js_std_free_handlers(rt);
JS_FreeContext(ctx);
JS_FreeRuntime(rt);
return 0;
}`,
		);
	});
