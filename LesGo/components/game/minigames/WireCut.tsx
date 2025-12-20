import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WireCutProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

type WireState = 'intact' | 'cut';
type WireType = 'safe' | 'boom' | 'dull';

interface Wire {
    id: number;
    color: string;
    type: WireType;
    state: WireState;
}

export default function WireCut({ visible, onClose, colors }: WireCutProps) {
    const [wires, setWires] = useState<Wire[]>([]);
    const [gameState, setGameState] = useState<'playing' | 'boom' | 'safe'>('playing');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setGameState('playing');
        setMessage('Corta el cable correcto');

        // Define wire colors
        const wireColors = ['#F44336', '#2196F3', '#4CAF50', '#FFEB3B'];

        // Define behaviors: 1 Safe, 2 Boom, 1 Dull
        const types: WireType[] = ['safe', 'boom', 'boom', 'dull'];

        // Shuffle types
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }

        const newWires = wireColors.map((color, index) => ({
            id: index,
            color,
            type: types[index],
            state: 'intact' as WireState
        }));

        setWires(newWires);
    };

    const handleCut = (id: number) => {
        if (gameState !== 'playing') return;

        const updatedWires = wires.map(w => w.id === id ? { ...w, state: 'cut' as WireState } : w);
        setWires(updatedWires);

        const wire = wires.find(w => w.id === id);
        if (!wire) return;

        if (wire.type === 'boom') {
            setGameState('boom');
            setMessage('¡BOOOOM!');
        } else if (wire.type === 'safe') {
            setGameState('safe');
            setMessage('¡BOMBA DESACTIVADA!');
        } else {
            setMessage('... Nada. Corta otro.');
        }
    };

    const handleClose = () => {
        onClose(gameState === 'safe');
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={[styles.overlay, { backgroundColor: gameState === 'boom' ? '#D32F2F' : 'rgba(0,0,0,0.95)' }]}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground, borderColor: colors.pink }]}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {gameState === 'boom' ? '💀💥💀' : 'CORTA CABLES'}
                    </Text>

                    <MaterialCommunityIcons
                        name={gameState === 'boom' ? "bomb-off" : "bomb"}
                        size={80}
                        color={colors.text}
                        style={{ marginBottom: 20 }}
                    />

                    <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

                    <View style={styles.wiresContainer}>
                        {wires.map((wire) => (
                            <TouchableOpacity
                                key={wire.id}
                                style={[styles.wireRow, { opacity: wire.state === 'cut' ? 0.5 : 1 }]}
                                onPress={() => wire.state === 'intact' && handleCut(wire.id)}
                                disabled={wire.state === 'cut' || gameState !== 'playing'}
                            >
                                <View style={styles.terminal} />
                                <View style={[
                                    styles.cable,
                                    { backgroundColor: wire.color },
                                    wire.state === 'cut' && styles.cutCable
                                ]} />
                                <View style={styles.terminal} />

                                {wire.state === 'cut' && (
                                    <View style={styles.cutIcon}>
                                        <MaterialCommunityIcons name="scissors-cutting" size={24} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {gameState !== 'playing' && (
                        <TouchableOpacity
                            style={[
                                styles.closeButton,
                                { backgroundColor: gameState === 'safe' ? '#4CAF50' : '#F44336' }
                            ]}
                            onPress={handleClose}
                        >
                            <Text style={styles.closeButtonText}>
                                {gameState === 'safe' ? '¡SOBREVIVIR!' : 'BEBER'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        padding: 25,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        height: 30,
    },
    wiresContainer: {
        width: '100%',
        marginBottom: 30,
    },
    wireRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        height: 50,
    },
    terminal: {
        width: 15,
        height: 15,
        borderRadius: 8,
        backgroundColor: '#555',
    },
    cable: {
        flex: 1,
        height: 8,
        marginHorizontal: 5,
        borderRadius: 4,
    },
    cutCable: {
        backgroundColor: 'transparent',
        borderBottomWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#999',
    },
    cutIcon: {
        position: 'absolute',
        left: '50%',
        top: 10,
        marginLeft: -12,
    },
    closeButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
