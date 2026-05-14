export interface DndEntry {
  id: number;
  name: string;
  status: string;
  dnd_value: string;
  dnd_type: 'GLOBAL' | 'SENDER' | 'NETWORK_ID';
  created_at: string;
  updated_at: string | null;
  created_by_id: number;
  updated_by_id: number;
}
