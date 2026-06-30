const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const zigLib = b.addLibrary(.{
        .name = "gpick_os",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/gpick_os.zig"),
            .target = target,
            .optimize = optimize,
            .link_libc = true,
        }),
    });
    zigLib.root_module.addCSourceFiles(.{
        .files = &.{
            "src/quickjs_wrappers.c",
            "quickjs/quickjs.c",
            "quickjs/quickjs-libc.c",
            "quickjs/cutils.c",
            "quickjs/libregexp.c",
            "quickjs/libunicode.c",
            "quickjs/dtoa.c",
        },
        .flags = &.{
            "-DCONFIG_VERSION=\"1.0.0\"",
            "-fno-sanitize=undefined",
            "-O3",
            "-flto",
        },
    });

    const exe = b.addExecutable(.{
        .name = "gpick",
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,

            .link_libc = true,
        }),
    });

    exe.root_module.addCSourceFile(.{
        .file = b.path("dist/main.c"),
        .flags = &.{ "-O3", "-flto" },
    });

    exe.root_module.linkLibrary(zigLib);

    // if (target.result.os.tag != .windows or target.result.abi == .gnu) {
    //     exe.linkSystemLibrary("pthread");
    //     exe.linkSystemLibrary("m");
    // }

    b.installArtifact(exe);

    const exeCheck = b.addExecutable(.{
        .name = "gpick",
        .root_module = zigLib.root_module,
    });
    b.step("check", "Build on save").*.dependOn(&exeCheck.step);
}
