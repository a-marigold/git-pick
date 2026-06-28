#include "gpick-os.h"
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#include <windows.h>
#else
#include <unistd.h>
#include <sys/wait.h>
#endif
#if defined(_WIN32)
#include <windows.h>
#else
#include <unistd.h>
#include <sys/wait.h>
#include <fcntl.h>
#endif

#if defined(_WIN32)
static JSValue read_handle_to_js_string(JSContext *ctx, HANDLE hPipe) {
    size_t capacity = 1024, length = 0;
    char *buf = malloc(capacity);
    if (!buf) return JS_EXCEPTION;
    buf[0] = '\0';

    DWORD read;
    char chunk[256];
    while (ReadFile(hPipe, chunk, sizeof(chunk) - 1, &read, NULL) && read > 0) {
        if (length + read >= capacity) {
            capacity *= 2;
            char *new_buf = realloc(buf, capacity);
            if (!new_buf) { free(buf); return JS_EXCEPTION; }
            buf = new_buf;
        }
        memcpy(buf + length, chunk, read);
        length += read;
        buf[length] = '\0';
    }
    JSValue res = JS_NewString(ctx, buf);
    free(buf);
    return res;
}
#else
static JSValue read_fd_to_js_string(JSContext *ctx, int fd) {
    size_t capacity = 1024, length = 0;
    char *buf = malloc(capacity);
    if (!buf) return JS_EXCEPTION;
    buf[0] = '\0';

    ssize_t read_bytes;
    char chunk[256];
    while ((read_bytes = read(fd, chunk, sizeof(chunk) - 1)) > 0) {
        if (length + read_bytes >= capacity) {
            capacity *= 2;
            char *new_buf = realloc(buf, capacity);
            if (!new_buf) { free(buf); return JS_EXCEPTION; }
            buf = new_buf;
        }
        memcpy(buf + length, chunk, read_bytes);
        length += read_bytes;
        buf[length] = '\0';
    }
    JSValue res = JS_NewString(ctx, buf);
    free(buf);
    return res;
}
#endif

/* exec([exe_name, arg1, arg2, ...]): { stdout: string, stderr: string } | null */
static JSValue gpick_os_exec(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
        if (argc < 1 || !JS_IsArray(ctx, argv[0])) {
        return JS_NULL;
    }

    JSValue len_val = JS_GetPropertyStr(ctx, argv[0], "length");
    uint32_t js_argc = 0;
    JS_ToUint32(ctx, &js_argc, len_val);
    JS_FreeValue(ctx, len_val);

        if (js_argc < 1) {
        return JS_NULL;
    }

    JSValue stdout_res = JS_UNDEFINED;



	JSValue stderr_res = JS_UNDEFINED;

	
	
#if defined(_WIN32)
    {
        HANDLE out_read, out_write;
        HANDLE err_read, err_write;
        SECURITY_ATTRIBUTES sa;
        sa.nLength = sizeof(SECURITY_ATTRIBUTES);
        sa.bInheritHandle = TRUE;
        sa.lpSecurityDescriptor = NULL;

        CreatePipe(&out_read, &out_write, &sa, 0);
        CreatePipe(&err_read, &err_write, &sa, 0);
        SetHandleInformation(out_read, HANDLE_FLAG_INHERIT, 0);
        SetHandleInformation(err_read, HANDLE_FLAG_INHERIT, 0);

        size_t cmd_len = 0;
        for (uint32_t i = 0; i < js_argc; i++) {
            JSValue arg_val = JS_GetPropertyUint32(ctx, argv[0], i);
            const char *arg_str = JS_ToCString(ctx, arg_val);
            if (arg_str) {
                cmd_len += strlen(arg_str) + 3;
                JS_FreeCString(ctx, arg_str);
            }
            JS_FreeValue(ctx, arg_val);
        }

        char *cmd_line = malloc(cmd_len + 1);
        cmd_line[0] = '\0';

        for (uint32_t i = 0; i < js_argc; i++) {
            JSValue arg_val = JS_GetPropertyUint32(ctx, argv[0], i);
            const char *arg_str = JS_ToCString(ctx, arg_val);
            if (arg_str) {
                strcat(cmd_line, "\"");
                strcat(cmd_line, arg_str);
                strcat(cmd_line, "\" ");
                JS_FreeCString(ctx, arg_str);
            }
            JS_FreeValue(ctx, arg_val);
        }

        STARTUPINFOA si;
        PROCESS_INFORMATION pi;
        memset(&si, 0, sizeof(si));
        si.cb = sizeof(si);
        si.dwFlags |= STARTF_USESTDHANDLES;
        si.hStdOutput = out_write;
        si.hStdError = err_write;
        si.hStdInput = GetStdHandle(STD_INPUT_HANDLE);
        memset(&pi, 0, sizeof(pi));

        if (CreateProcessA(NULL, cmd_line, NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi)) {
            CloseHandle(out_write);
            CloseHandle(err_write);

            stdout_res = read_handle_to_js_string(ctx, out_read);
            stderr_res = read_handle_to_js_string(ctx, err_read);

            WaitForSingleObject(pi.hProcess, INFINITE);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
        } else {
			CloseHandle(out_write); CloseHandle(out_read);
            CloseHandle(err_write); CloseHandle(err_read);
            free(cmd_line);
            return JS_NULL; 
        }
        CloseHandle(out_read);
        CloseHandle(err_read);
        free(cmd_line);
    }
#else
        {
        int out_pipe[2], err_pipe[2];
        if (pipe(out_pipe) < 0 || pipe(err_pipe) < 0) {
            return JS_NULL;         
		}

        char **exec_argv = malloc(sizeof(char*) * (js_argc + 1));
        for (uint32_t i = 0; i < js_argc; i++) {
            JSValue arg_val = JS_GetPropertyUint32(ctx, argv[0], i);
            exec_argv[i] = (char *)JS_ToCString(ctx, arg_val);
            JS_FreeValue(ctx, arg_val);
        }
        exec_argv[js_argc] = NULL;

        int pid = fork();
        if (pid < 0) {
            for (uint32_t i = 0; i < js_argc; i++) JS_FreeCString(ctx, exec_argv[i]);
            free(exec_argv);
            return JS_NULL;         }

        if (pid == 0) {
            dup2(out_pipe[1], STDOUT_FILENO);
            dup2(err_pipe[1], STDERR_FILENO);
            close(out_pipe[0]); close(out_pipe[1]);
            close(err_pipe[0]); close(err_pipe[1]);

            execvp(exec_argv[0], exec_argv);
            _exit(127);
        } else {
            close(out_pipe[1]);
            close(err_pipe[1]);

            stdout_res = read_fd_to_js_string(ctx, out_pipe[0]);
            stderr_res = read_fd_to_js_string(ctx, err_pipe[0]);

            close(out_pipe[0]);
            close(err_pipe[0]);

            int status;
            waitpid(pid, &status, 0);
        }

        for (uint32_t i = 0; i < js_argc; i++) { JS_FreeCString(ctx, exec_argv[i]) };
        
		free(exec_argv);
    }
#endif

	JSValue res_obj = JS_NewObject(ctx);
    
	JS_SetPropertyStr(ctx, res_obj, "stdout", stdout_res);
    JS_SetPropertyStr(ctx, res_obj, "stderr", stderr_res);
 
	return res_obj;
}




static const JSCFunctionListEntry gpick_os_funcs[] = {
    JS_CFUNC_DEF("exec", 2, gpick_os_exec),
};

static int gpick_os_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, gpick_os_funcs, sizeof(gpick_os_funcs) / sizeof(gpick_os_funcs[0]));
}

JSModuleDef *init_gpick_os_module(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, gpick_os_init);
    if (!m) return NULL;
    JS_AddModuleExportList(ctx, m, gpick_os_funcs, sizeof(gpick_os_funcs) / sizeof(gpick_os_funcs[0]));
    return m;
}
