import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Platform, Alert, Modal, KeyboardAvoidingView, ActivityIndicator, Image, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Plus, Pencil, Trash2, BadgeCheck, CalendarDays, Camera, ImageIcon, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions, useMediaLibraryPermissions } from 'expo-image-picker';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface PlantPassportEntry {
  id: string;
  name: string;
  species?: string;
  acquiredOn?: string; // ISO date string
  notes?: string;
  images?: string[]; // Array of image URIs
  location?: string;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  careLevel?: 'low' | 'medium' | 'high';
}

export default function PassportScreen() {
  const [plants, setPlants] = useState<PlantPassportEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ 
    name: string; 
    species: string; 
    acquiredOn: string; 
    notes: string;
    images: string[];
    location: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    careLevel: 'low' | 'medium' | 'high';
  }>({ 
    name: '', 
    species: '', 
    acquiredOn: '', 
    notes: '',
    images: [],
    location: '',
    healthStatus: 'good',
    careLevel: 'medium'
  });
  const [imagePickerVisible, setImagePickerVisible] = useState<boolean>(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = useMediaLibraryPermissions();

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
    setForm({ 
      name: '', 
      species: '', 
      acquiredOn: new Date().toISOString().slice(0, 10), 
      notes: '',
      images: [],
      location: '',
      healthStatus: 'good',
      careLevel: 'medium'
    });
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((item: PlantPassportEntry) => {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      species: item.species ?? '',
      acquiredOn: (item.acquiredOn ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
      notes: item.notes ?? '',
      images: item.images ?? [],
      location: item.location ?? '',
      healthStatus: item.healthStatus ?? 'good',
      careLevel: item.careLevel ?? 'medium'
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
      images: form.images.length > 0 ? form.images : undefined,
      location: form.location.trim() || undefined,
      healthStatus: form.healthStatus,
      careLevel: form.careLevel,
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

  const addImage = useCallback(async (source: 'camera' | 'library') => {
    try {
      let result;
      
      if (source === 'camera') {
        if (!cameraPermission?.granted) {
          const permission = await requestCameraPermission();
          if (!permission.granted) {
            Alert.alert('Permission needed', 'Camera access is required to take photos.');
            return;
          }
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        if (!mediaPermission?.granted) {
          const permission = await requestMediaPermission();
          if (!permission.granted) {
            Alert.alert('Permission needed', 'Photo library access is required to select photos.');
            return;
          }
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const newImages = [...form.images, result.assets[0].uri];
        setForm(prev => ({ ...prev, images: newImages }));
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to add image. Please try again.');
    }
    setImagePickerVisible(false);
  }, [cameraPermission, mediaPermission, requestCameraPermission, requestMediaPermission, form.images]);

  const removeImage = useCallback((index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, images: newImages }));
  }, [form.images]);

  const getHealthStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'excellent': return Colors.light.success;
      case 'good': return Colors.light.luxuryAccent;
      case 'fair': return Colors.light.warning;
      case 'poor': return Colors.light.error;
      default: return Colors.light.luxuryAccent;
    }
  }, []);

  const getCareLevel = useCallback((level: string) => {
    switch (level) {
      case 'low': return { text: 'Low Maintenance', color: Colors.light.success };
      case 'medium': return { text: 'Medium Care', color: Colors.light.warning };
      case 'high': return { text: 'High Maintenance', color: Colors.light.error };
      default: return { text: 'Medium Care', color: Colors.light.warning };
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: PlantPassportEntry }) => {
    const acquired = item.acquiredOn ? new Date(item.acquiredOn).toISOString().slice(0, 10) : undefined;
    const healthColor = getHealthStatusColor(item.healthStatus || 'good');
    const careInfo = getCareLevel(item.careLevel || 'medium');
    
    return (
      <View style={styles.card} testID={`passport-item-${item.id}`}>
        {item.images && item.images.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {item.images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.plantImage} />
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Leaf color={Colors.light.luxuryPrimary} size={20} />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.species ? <Text style={styles.cardSubtitle}>{item.species}</Text> : null}
              {item.location ? <Text style={styles.locationText}>📍 {item.location}</Text> : null}
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
          
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${healthColor}15`, borderColor: `${healthColor}35` }]}>
              <Text style={[styles.statusText, { color: healthColor }]}>Health: {item.healthStatus || 'Good'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${careInfo.color}15`, borderColor: `${careInfo.color}35` }]}>
              <Text style={[styles.statusText, { color: careInfo.color }]}>{careInfo.text}</Text>
            </View>
          </View>
          
          {acquired ? (
            <View style={styles.metaRow}>
              <CalendarDays color={Colors.light.luxuryTextSecondary} size={14} />
              <Text style={styles.metaText}>Added {acquired}</Text>
            </View>
          ) : null}
          
          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
          
          <View style={styles.badge}>
            <BadgeCheck color={Colors.light.luxuryGold} size={14} />
            <Text style={styles.badgeText}>In your collection</Text>
          </View>
        </View>
      </View>
    );
  }, [openEdit, remove, getHealthStatusColor, getCareLevel]);

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
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Plant' : 'Add New Plant'}</Text>
              
              {/* Image Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                  {form.images.map((uri, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.removeImageBtn} 
                        onPress={() => removeImage(index)}
                      >
                        <X color="#fff" size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addImageBtn} 
                    onPress={() => setImagePickerVisible(true)}
                  >
                    <Plus color={Colors.light.luxuryPrimary} size={24} />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              
              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Plant name (required)"
                  placeholderTextColor={Colors.light.luxuryTextSecondary}
                  value={form.name}
                  onChangeText={(t) => setForm((s) => ({ ...s, name: t }))}
                  maxLength={60}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Species or variety"
                  placeholderTextColor={Colors.light.luxuryTextSecondary}
                  value={form.species}
                  onChangeText={(t) => setForm((s) => ({ ...s, species: t }))}
                  maxLength={80}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location (e.g., Living room, Garden)"
                  placeholderTextColor={Colors.light.luxuryTextSecondary}
                  value={form.location}
                  onChangeText={(t) => setForm((s) => ({ ...s, location: t }))}
                  maxLength={50}
                />
              </View>
              
              {/* Status & Care */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health & Care</Text>
                <View style={styles.pickerRow}>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Health Status</Text>
                    <View style={styles.pickerOptions}>
                      {['excellent', 'good', 'fair', 'poor'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.pickerOption,
                            form.healthStatus === status && styles.pickerOptionSelected
                          ]}
                          onPress={() => setForm(s => ({ ...s, healthStatus: status as any }))}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            form.healthStatus === status && styles.pickerOptionTextSelected
                          ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Care Level</Text>
                  <View style={styles.pickerOptions}>
                    {[{ key: 'low', label: 'Low' }, { key: 'medium', label: 'Medium' }, { key: 'high', label: 'High' }].map((level) => (
                      <TouchableOpacity
                        key={level.key}
                        style={[
                          styles.pickerOption,
                          form.careLevel === level.key && styles.pickerOptionSelected
                        ]}
                        onPress={() => setForm(s => ({ ...s, careLevel: level.key as any }))}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          form.careLevel === level.key && styles.pickerOptionTextSelected
                        ]}>
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              {/* Date & Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Date acquired (YYYY-MM-DD)"
                  placeholderTextColor={Colors.light.luxuryTextSecondary}
                  value={form.acquiredOn}
                  onChangeText={(t) => setForm((s) => ({ ...s, acquiredOn: t }))}
                />
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Notes, care instructions, or observations..."
                  placeholderTextColor={Colors.light.luxuryTextSecondary}
                  value={form.notes}
                  onChangeText={(t) => setForm((s) => ({ ...s, notes: t }))}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)} testID="cancel-modal">
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={submit} testID="save-plant">
                  <Check color="#fff" size={18} />
                  <Text style={styles.saveText}>{editingId ? 'Save Changes' : 'Add Plant'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Image Picker Modal */}
      <Modal transparent visible={imagePickerVisible} animationType="fade" onRequestClose={() => setImagePickerVisible(false)}>
        <View style={styles.imagePickerBackdrop}>
          <View style={styles.imagePickerCard}>
            <Text style={styles.imagePickerTitle}>Add Photo</Text>
            <TouchableOpacity style={styles.imagePickerOption} onPress={() => addImage('camera')}>
              <Camera color={Colors.light.luxuryPrimary} size={24} />
              <Text style={styles.imagePickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imagePickerOption} onPress={() => addImage('library')}>
              <ImageIcon color={Colors.light.luxuryPrimary} size={24} />
              <Text style={styles.imagePickerOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imagePickerCancel} onPress={() => setImagePickerVisible(false)}>
              <Text style={styles.imagePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  modalBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  cancelBtn: { backgroundColor: Colors.light.luxuryIvory, marginRight: 8, borderWidth: 1, borderColor: Colors.light.luxuryBorder },
  saveBtn: { backgroundColor: Colors.light.luxuryPrimary, marginLeft: 8 },
  cancelText: { color: Colors.light.luxuryText, fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '700' },
  
  // Image styles
  imageContainer: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  imageScroll: { flexDirection: 'row' },
  plantImage: { width: 120, height: 120, borderRadius: 8, marginRight: 8 },
  cardContent: { flex: 1 },
  locationText: { fontSize: 11, color: Colors.light.luxuryTextSecondary, marginTop: 2 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '600' },
  
  // Modal styles
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  imageSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.luxuryText, marginBottom: 12 },
  imagePreviewScroll: { flexDirection: 'row' },
  imagePreview: { position: 'relative', marginRight: 12 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: Colors.light.error, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  addImageBtn: { width: 80, height: 80, borderRadius: 8, borderWidth: 2, borderColor: Colors.light.luxuryBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.luxuryIvory },
  addImageText: { fontSize: 10, color: Colors.light.luxuryPrimary, fontWeight: '600', marginTop: 4 },
  
  section: { marginBottom: 20 },
  pickerRow: { marginBottom: 16 },
  pickerContainer: { marginBottom: 12 },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: Colors.light.luxuryText, marginBottom: 8 },
  pickerOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.light.luxuryBorder, backgroundColor: Colors.light.luxuryIvory },
  pickerOptionSelected: { backgroundColor: Colors.light.luxuryPrimary, borderColor: Colors.light.luxuryPrimary },
  pickerOptionText: { fontSize: 12, fontWeight: '600', color: Colors.light.luxuryText },
  pickerOptionTextSelected: { color: '#fff' },
  
  // Image picker modal
  imagePickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  imagePickerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, margin: 20, minWidth: 280 },
  imagePickerTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.luxuryText, marginBottom: 16, textAlign: 'center' },
  imagePickerOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.light.luxuryIvory, marginBottom: 8 },
  imagePickerOptionText: { fontSize: 16, fontWeight: '600', color: Colors.light.luxuryText },
  imagePickerCancel: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  imagePickerCancelText: { fontSize: 16, fontWeight: '600', color: Colors.light.luxuryTextSecondary },
});
