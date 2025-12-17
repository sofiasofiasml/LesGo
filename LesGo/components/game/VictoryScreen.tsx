import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface VictoryScreenProps {
    winner: string;
    scores: Record<string, number>;
    onContinue: () => void;
    onReset: () => void;
    colors: any;
    targetScore: number;
}

export default function VictoryScreen({ winner, scores, onContinue, onReset, colors, targetScore }: VictoryScreenProps) {
    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: colors.darkPink }]}>¡VICTORIA!</Text>
            <FontAwesome name="trophy" size={100} color={colors.orange} style={{ marginVertical: 30 }} />
            <Text style={[styles.winnerText, { color: colors.text }]}>{winner}</Text>
            <Text style={[styles.winnerSubtext, { color: colors.text }]}>ha ganado con {scores[winner]} puntos</Text>

            <View style={styles.finalScoreboard}>
                <Text style={[styles.scoreboardTitle, { color: colors.text }]}>Clasificación Final</Text>
                {Object.entries(scores)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .map(([player, score]: any, index) => (
                        <View key={index} style={styles.scoreRow}>
                            <Text style={[styles.scorePlayerName, { color: colors.text }]}>
                                {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}{player}
                            </Text>
                            <Text style={[styles.scorePoints, { color: colors.darkPink }]}>
                                {score} pts
                            </Text>
                        </View>
                    ))}
            </View>

            <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.pink, marginTop: 30 }]}
                onPress={onContinue}
            >
                <Text style={styles.startButtonText}>CONTINUAR (A LOS {targetScore ? targetScore + 30 : 60})</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.resetButton, { marginTop: 20 }]}
                onPress={onReset}
            >
                <Text style={{ color: colors.darkPink }}>Terminar y Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 45,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    winnerText: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    winnerSubtext: {
        fontSize: 18,
        opacity: 0.8,
        marginBottom: 30,
    },
    finalScoreboard: {
        width: '100%',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
    },
    scoreboardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    scorePlayerName: {
        fontSize: 18,
    },
    scorePoints: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    startButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resetButton: {
        padding: 10,
    },
});
