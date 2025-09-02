import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Platform, Alert, Modal, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Plus, Pencil, Trash2, BadgeCheck, CalendarDays } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PlantPassportEntry {
  id: string;
  name: string;
  species?: string;
  acquiredOn?: string; // ISO date string
  notes?: string;
}

export default function PassportScreen() {
  const [plants, setPlants] = useState<PlantPassportEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; species: string; acquiredOn: string; notes: string }>({ name: '', species: '', acquiredOn: '', notes: '' });

  const storageKey = 'plant-passport-v1';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(storageKey);
      const data: PlantPassportEntry[] = raw ? JSON.parse(raw) : [];
      setPlants(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('[Passport] load failed', e);
      Alert.alert('Error', 'Failed to load your plant journal.');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (next: PlantPassportEntry[]) => {
    try {
      setPlants(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
      console.log('[Passport] save failed', e);
      Alert.alert('Error', 'Failed to save changes.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm({ name: '', species: '', acquiredOn: new Date().toISOString().slice(0, 10), notes: '' });
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((item: PlantPassportEntry) => {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      species: item.species ?? '',
      acquiredOn: (item.acquiredOn ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
      notes: item.notes ?? '',
    });
    setModalVisible(true);
  }, []);

  const remove = useCallback((id: string) => {
    Alert.alert('Delete Plant', 'Are you sure you want to remove this plant from your journal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => save(plants.filter(p => p.id !== id)) },
    ]);
  }, [plants, save]);

  const submit = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter a plant name.');
      return;
    }
    const entry: PlantPassportEntry = {
      id: editingId ?? String(Date.now()),
      name: form.name.trim(),
      species: form.species.trim() || undefined,
      acquiredOn: form.acquiredOn ? new Date(form.acquiredOn).toISOString() : undefined,
      notes: form.notes.trim() || undefined,
    };

    if (editingId) {
      const next = plants.map(p => (p.id === editingId ? entry : p));
      save(next);
    } else {
      const next = [entry, ...plants];
      save(next);
    }
    setModalVisible(false);
  }, [editingId, form, plants, save]);

  const renderItem = useCallback(({ item }: { item: PlantPassportEntry }) => {
    const acquired = item.acquiredOn ? new Date(item.acquiredOn).toISOString().slice(0, 10) : undefined;
    return (
      <View style={styles.card} testID={`passport-item-${item.id}`}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Leaf color={Colors.light.luxuryPrimary} size={20} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.species ? <Text style={styles.cardSubtitle}>{item.species}</Text> : null}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => openEdit(item)} style={styles.iconBtn} testID={`edit-${item.id}`}>
              <Pencil color={Colors.light.luxuryPrimary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => remove(item.id)} style={styles.iconBtn} testID={`delete-${item.id}`}>
              <Trash2 color="#B00020" size={18} />
            </TouchableOpacity>
          </View>
        </View>
        {acquired ? (
          <View style={styles.metaRow}>
            <CalendarDays color={Colors.light.luxuryTextSecondary} size={14} />
            <Text style={styles.metaText}>Acquired {acquired}</Text>
          </View>
        ) : null}
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        <View style={styles.badge}>
          <BadgeCheck color={Colors.light.luxuryGold} size={14} />
          <Text style={styles.badgeText}>Verified by you</Text>
        </View>
      </View>
    );
  }, [openEdit, remove]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.light.luxuryGradientStart, Colors.light.luxuryGradientEnd]} style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerIcon}>
            <Leaf color={Colors.light.luxuryGold} size={28} />
          </View>
          <Text style={styles.headerTitle}>Plant Journal</Text>
          <Text style={styles.headerSubtitle}>Keep track of your plant collection</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate} testID="add-plant">
            <Plus color="#fff" size={18} />
            <Text style={styles.addBtnText}>Add Plant</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.light.luxuryPrimary} />
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Your journal is empty</Text>
              <Text style={styles.emptySubtitle}>Add your first plant to start tracking your collection.</Text>
            </View>
          }
        />
      )}

      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Plant' : 'Add Plant'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (required)"
              placeholderTextColor={Colors.light.luxuryTextSecondary}
              value={form.name}
              onChangeText={(t) => setForm((s) => ({ ...s, name: t }))}
              maxLength={60}
            />
            <TextInput
              style={styles.input}
              placeholder="Species (optional)"
              placeholderTextColor={Colors.light.luxuryTextSecondary}
              value={form.species}
              onChangeText={(t) => setForm((s) => ({ ...s, species: t }))}
              maxLength={80}
            />
            <TextInput
              style={styles.input}
              placeholder="Acquired On (YYYY-MM-DD)"
              placeholderTextColor={Colors.light.luxuryTextSecondary}
              value={form.acquiredOn}
              onChangeText={(t) => setForm((s) => ({ ...s, acquiredOn: t }))}
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes"
              placeholderTextColor={Colors.light.luxuryTextSecondary}
              value={form.notes}
              onChangeText={(t) => setForm((s) => ({ ...s, notes: t }))}
              multiline
              maxLength={500}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)} testID="cancel-modal">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={submit} testID="save-plant">
                <Text style={styles.saveText}>{editingId ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.luxuryBackground },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerInner: { alignItems: 'center' },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)', marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  addBtn: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.light.luxuryPrimary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  listContent: { padding: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.luxuryText },
  emptySubtitle: { fontSize: 14, color: Colors.light.luxuryTextSecondary, marginTop: 6 },
  card: { backgroundColor: Colors.light.luxuryCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.light.luxuryBorder },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.light.luxuryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: Colors.light.luxuryAccent },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.luxuryText },
  cardSubtitle: { fontSize: 12, color: Colors.light.luxuryTextSecondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: Colors.light.luxuryIvory, borderWidth: 1, borderColor: Colors.light.luxuryBorder },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontSize: 12, color: Colors.light.luxuryTextSecondary },
  notes: { marginTop: 10, fontSize: 14, color: Colors.light.luxuryText, lineHeight: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, backgroundColor: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.35)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, marginTop: 12 },
  badgeText: { fontSize: 12, fontWeight: '700', color: Colors.light.luxuryGold, letterSpacing: 0.3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.light.luxuryBorder },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.luxuryText, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: Colors.light.luxuryBorder, backgroundColor: Colors.light.luxuryIvory, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: Colors.light.luxuryText, marginBottom: 10 },
  notesInput: { minHeight: 90, textAlignVertical: 'top' as const },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  modalBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  cancelBtn: { backgroundColor: Colors.light.luxuryIvory, marginRight: 8, borderWidth: 1, borderColor: Colors.light.luxuryBorder },
  saveBtn: { backgroundColor: Colors.light.luxuryPrimary, marginLeft: 8 },
  cancelText: { color: Colors.light.luxuryText, fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '700' },
});
