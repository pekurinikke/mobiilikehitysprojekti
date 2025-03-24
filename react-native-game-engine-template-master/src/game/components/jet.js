import React, { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

const HUDRenderer = memo(({ gamepadController = {} }) => {
    const {
        stickRadius = 0,
        stickPosition = { x: 0, y: 0 },
        aRadius = 0,
        aPosition = { x: 0, y: 0 },
        bRadius = 0,
        bPosition = { x: 0, y: 0 },
        a = false,
        b = false,
        x = 0,
        y = 0
    } = gamepadController;

    const usingStick = !!(x || y);

    const stickStyle = useMemo(() => ({
        width: stickRadius * 2,
        height: stickRadius * 2,
        borderRadius: stickRadius,
        left: stickPosition.x - stickRadius,
        top: stickPosition.y - stickRadius,
        backgroundColor: usingStick ? "white" : "transparent"
    }), [stickRadius, stickPosition, usingStick]);

    const guideStyle = useMemo(() => ({
        width: stickRadius * 3,
        height: stickRadius * 3,
        borderRadius: stickRadius * 1.5,
        borderWidth: usingStick ? 5 : 0,
        left: stickPosition.x - stickRadius * 1.5,
        top: stickPosition.y - stickRadius * 1.5
    }), [stickRadius, stickPosition, usingStick]);

    const buttonStyle = (radius, position, active) => ({
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        left: position.x - radius,
        top: position.y - radius,
        backgroundColor: active ? "white" : "transparent"
    });

    return (
        <>
            <View style={[styles.container, stickStyle]} />
            <View style={[styles.container, guideStyle]} />
            <View style={[styles.container, buttonStyle(aRadius, aPosition, a)]} />
            <View style={[styles.container, buttonStyle(bRadius, bPosition, b)]} />
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        backgroundColor: "transparent",
        borderWidth: 5,
        borderColor: "white",
        opacity: 0.25
    }
});

export default () => ({ renderer: <HUDRenderer /> });
