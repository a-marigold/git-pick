const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "gpick",
        .root_module = b.createModule(.{
            .target = target,
            .optimize = optimize,
            .link_libc = true,
        }),
    });

    const zigLib = b.addLibrary(.{ .name = "gpick_os", .root_module = b.createModule(.{
        .root_source_file = b.path("./src/gpick_os.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    }) });

    exe.root_module.addCSourceFiles(.{ .files = &.{
        "./dist/main.c",
        "./quickjs/quickjs.c",
        "./quickjs/quickjs-libc.c",
        "./quickjs/cutils.c",
        "./quickjs/libregexp.c",
        "./quickjs/libunicode.c",
        "./quickjs/dtoa.c",
    }, .flags = &.{ "-O3", "-DCONFIG_VERSION=\"1.0.0\"", "-flto" } });

    exe.root_module.addIncludePath(b.path("./quickjs"));

    exe.root_module.linkLibrary(zigLib);

    // if (target.result.os.tag != .windows or target.result.abi == .gnu) {
    //     exe.linkSystemLibrary("pthread");
    //     exe.linkSystemLibrary("m");
    // }

    b.installArtifact(exe);
}
