import React, { memo } from "react";
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

    const usingStick = Boolean(x || y);

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        width: stickRadius * 2,
                        height: stickRadius * 2,
                        borderRadius: stickRadius,
                        left: stickPosition.x - stickRadius,
                        top: stickPosition.y - stickRadius,
                        backgroundColor: usingStick ? "white" : "transparent"
                    }
                ]}
            />
            <View
                style={[
                    styles.container,
                    {
                        width: stickRadius * 3,
                        height: stickRadius * 3,
                        borderRadius: stickRadius * 1.5,
                        borderWidth: usingStick ? 5 : 0,
                        left: stickPosition.x - stickRadius * 1.5,
                        top: stickPosition.y - stickRadius * 1.5,
                    }
                ]}
            />
            <View
                style={[
                    styles.container,
                    {
                        width: aRadius * 2,
                        height: aRadius * 2,
                        borderRadius: aRadius,
                        left: aPosition.x - aRadius,
                        top: aPosition.y - aRadius,
                        backgroundColor: a ? "white" : "transparent"
                    }
                ]}
            />
            <View
                style={[
                    styles.container,
                    {
                        width: bRadius * 2,
                        height: bRadius * 2,
                        borderRadius: bRadius,
                        left: bPosition.x - bRadius,
                        top: bPosition.y - bRadius,
                        backgroundColor: b ? "white" : "transparent"
                    }
                ]}
            />
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