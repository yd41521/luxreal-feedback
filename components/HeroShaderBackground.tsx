"use client";

import type { ComponentProps } from "react";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

export type ShaderGradientPreset = "home" | "delivered";

/** 想法广场（首页） */
const HOME_SHADER_PROPS = {
  animate: "on" as const,
  axesHelper: "off",
  brightness: 1.4,
  cAzimuthAngle: 180,
  cDistance: 1.9,
  cPolarAngle: 90,
  cameraZoom: 7.7,
  color1: "#ffffff",
  color2: "#b7b5ee",
  color3: "#ffd9ed",
  destination: "onCanvas",
  embedMode: "off",
  envPreset: "city",
  format: "gif",
  fov: 80,
  frameRate: 10,
  gizmoHelper: "hide",
  grain: "off",
  lightType: "3d" as const,
  pixelDensity: 0.4,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  range: "enabled" as const,
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  shader: "defaults",
  type: "waterPlane" as const,
  uAmplitude: 2.9,
  uDensity: 1.8,
  uFrequency: 5.5,
  uSpeed: 0.1,
  uStrength: 1.1,
  uTime: 0,
  wireframe: false,
};

/** 已上线页（与首页结构一致，仅渐变参数不同） */
const DELIVERED_SHADER_PROPS = {
  animate: "on" as const,
  axesHelper: "off",
  brightness: 1.4,
  cAzimuthAngle: 1,
  cDistance: 1.9,
  cPolarAngle: 90,
  cameraZoom: 7.7,
  color1: "#ffffff",
  color2: "#b7b5ee",
  color3: "#ffd9ed",
  destination: "onCanvas",
  embedMode: "off",
  envPreset: "city",
  format: "gif",
  fov: 80,
  frameRate: 10,
  gizmoHelper: "hide",
  grain: "off",
  lightType: "3d" as const,
  pixelDensity: 0.4,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  range: "enabled" as const,
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  shader: "defaults",
  type: "waterPlane" as const,
  uAmplitude: 2.9,
  uDensity: 1.8,
  uFrequency: 5.5,
  uSpeed: 0.1,
  uStrength: 1.1,
  uTime: 0,
  wireframe: false,
};

const PRESET_MAP = {
  home: { props: HOME_SHADER_PROPS, canvasPixelDensity: 0.4 },
  delivered: { props: DELIVERED_SHADER_PROPS, canvasPixelDensity: 0.4 },
} as const;

type ShaderProps = ComponentProps<typeof ShaderGradient>;

/**
 * Hero 底层 WebGL 渐变。建议由页面用 `next/dynamic` + `ssr: false` 挂载。
 */
export function HeroShaderBackground({
  preset = "home",
}: {
  preset?: ShaderGradientPreset;
}) {
  const { props, canvasPixelDensity } = PRESET_MAP[preset];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-[100dvh] min-h-[100svh] w-full"
    >
      {/*
        渐变放在独立 fixed 层，Canvas 仅 absolute 铺满该层（避免 z-index 只作用在 R3F 内层、盖住下方 main）。
        lazyLoad 关闭：否则观察节点在部分布局下会误判「不可见」或首帧高度为 0，导致列表区看似空白。
      */}
      <ShaderGradientCanvas
        className="!absolute inset-0 h-full w-full min-h-full"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        pointerEvents="none"
        pixelDensity={canvasPixelDensity}
        lazyLoad={false}
      >
        <ShaderGradient {...(props as ShaderProps)} />
      </ShaderGradientCanvas>
    </div>
  );
}
