import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { HighScoreEntry } from '@/utils/HighScoreManager';

interface HighScoreModalProps {
    visible: boolean;
    onClose: () => void;
    highScores: HighScoreEntry[];
    gameName: string;
    colors: any;
    isHigherBetter?: boolean; // To decide if formatting needs special handling (e.g. ms vs points)
    unit?: string;
}

export default function HighScoreModal({ visible, onClose, highScores, gameName, colors, isHigherBetter = true, unit }: HighScoreModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: colors.modalBackground, borderColor: colors.gold }]}>
                    <View style={styles.header}>
                        <FontAwesome name="trophy" size={40} color={colors.gold} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>SALÓN DE la FAMA</Text>
                        <Text style={[styles.gameSubtitle, { color: colors.pink }]}>{gameName}</Text>
                    </View>

                    <ScrollView style={styles.scoreList}>
                        {highScores.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.text }]}>Aún no hay récords. ¡Sé el primero!</Text>
                        ) : (
                            highScores.map((score, index) => (
                                <View key={`${score.date}-${index}`} style={[styles.scoreRow, { borderBottomColor: 'rgba(128,128,128,0.2)' }]}>
                                    <View style={styles.rankContainer}>
                                        <Text style={[styles.rankText, { color: index === 0 ? colors.gold : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : colors.text }]}>
                                            #{index + 1}
                                        </Text>
                                    </View>
                                    <Text style={[styles.playerName, { color: colors.text }]}>{score.playerName}</Text>
                                    <Text style={[styles.scoreValue, { color: colors.purple }]}>
                                        {score.score} {unit ? unit : (isHigherBetter ? 'pts' : 'ms')}
                                    </Text>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.pink }]}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>CERRAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalView: {
        width: '90%',
        margin: 20,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        maxHeight: '80%'
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    gameSubtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 5,
    },
    scoreList: {
        width: '100%',
        marginBottom: 20,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
    },
    rankText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    playerName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 10,
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        padding: 20,
        opacity: 0.6,
    },
    closeButton: {
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 30,
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});
