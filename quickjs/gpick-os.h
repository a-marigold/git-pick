#ifndef GPICK_OS_H
#define GPICK_OS_H

#include "quickjs.h"

#ifdef __cplusplus
extern "C" {
#endif

// inits 'gpick-os' javascript module
JSModuleDef *init_gpick_os_module(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
}

#endif

#endif 
/* GPICK_OS_H */