// Static data for the vehicle inspection screen (from the paper checklist).
// UI only - nothing here talks to the backend.

export const TOOLS = [
  { id: 'or_cr', label: 'OR and CR' },
  { id: 'car_jack', label: 'Car Jack' },
  { id: 'tire_wrench', label: 'Tire Wrench' },
  { id: 'spare_tire', label: 'Spare Tire' },
  { id: 'warning_device', label: 'Early Warning Device' },
  { id: 'car_matting', label: 'Car Matting' },
  { id: 'rain_visor', label: 'Rain Visor' },
  { id: 'seat_cover', label: 'Seat Cover' },
  { id: 'umbrella', label: 'Umbrella' },
  { id: 'freshener', label: 'Freshener' },
  { id: 'hub_cap', label: 'Hub Cap' },
]

export const TOOL_STATUSES = [
  { id: 'present', label: 'Present' },
  { id: 'missing', label: 'Missing' },
  { id: 'damaged', label: 'Damaged' },
]

// The paper form uses "GC" twice (Glass Chip and Gouges/Creases).
// `id` is unique and used in the data; `code` is what staff see on screen.
export const DAMAGE_CODES = [
  { id: 'SH', code: 'SH', label: 'Swirls/Holograms' },
  { id: 'WS', code: 'WS', label: 'Water Spots' },
  { id: 'OX', code: 'OX', label: 'Oxidation' },
  { id: 'CF', code: 'CF', label: 'Clearcoat Failure' },
  { id: 'DS', code: 'DS', label: 'Deep Scratch' },
  { id: 'BD', code: 'BD', label: 'Bird Dropping' },
  { id: 'RP', code: 'RP', label: 'Rough Paint' },
  { id: 'UD', code: 'UD', label: 'Unknown Defect' },
  { id: 'PT', code: 'PT', label: 'Paint Transfer' },
  { id: 'PC', code: 'PC', label: 'Paint Chip' },
  { id: 'GS', code: 'GS', label: 'Glass Scratch' },
  { id: 'GC_GLASS', code: 'GC', label: 'Glass Chip' },
  { id: 'DD', code: 'DD', label: 'Dents/Dings' },
  { id: 'SS', code: 'SS', label: 'Side Swipe' },
  { id: 'CR', code: 'CR', label: 'Curb Rash' },
  { id: 'WD', code: 'WD', label: 'Wheel Damage' },
  { id: 'GC_GOUGE', code: 'GC', label: 'Gouges/Crease' },
]

export const damageById = Object.fromEntries(DAMAGE_CODES.map((d) => [d.id, d]))

export const FUEL_LEVELS = ['Empty', '1/4', '1/2', '3/4', 'Full']

// Tappable parts of the fold-out car drawn on the paper checklist (drawing area is 300 x 464):
// front view at the top, top view in the middle, left and right sides folded out, rear view at the bottom.
// cx/cy is where damage markers are drawn.
// stack: 'v' stacks several markers vertically on narrow parts.
// hit: extra tap area (in drawing units) around small parts like mirrors.
// glass: drawn tinted like a window.
export const ZONES = [
  { id: 'front_bumper', label: 'Front bumper / grille', shape: 'rect', x: 92, y: 36, w: 116, h: 34, r: 10, cx: 150, cy: 53 },
  { id: 'hood', label: 'Hood', shape: 'path', d: 'M108 86 Q150 78 192 86 L194 150 L106 150 Z', cx: 150, cy: 118 },
  { id: 'windshield', label: 'Windshield', shape: 'poly', points: '106,154 194,154 186,190 114,190', cx: 150, cy: 172, glass: true },
  { id: 'roof', label: 'Roof', shape: 'rect', x: 114, y: 194, w: 72, h: 84, r: 6, cx: 150, cy: 236 },
  { id: 'rear_glass', label: 'Rear glass', shape: 'poly', points: '114,282 186,282 194,312 106,312', cx: 150, cy: 297, glass: true },
  { id: 'trunk', label: 'Trunk', shape: 'path', d: 'M106 316 L194 316 L192 368 Q150 376 108 368 Z', cx: 150, cy: 342 },
  { id: 'rear_bumper', label: 'Rear bumper', shape: 'rect', x: 92, y: 392, w: 116, h: 34, r: 10, cx: 150, cy: 409 },

  { id: 'fender_lf', label: 'Left front fender', shape: 'rect', x: 44, y: 84, w: 46, h: 66, r: 10, cx: 72, cy: 117, stack: 'v' },
  { id: 'door_lf', label: 'Left front door', shape: 'rect', x: 44, y: 154, w: 46, h: 76, r: 4, cx: 60, cy: 192, stack: 'v' },
  { id: 'door_lr', label: 'Left rear door', shape: 'rect', x: 44, y: 234, w: 46, h: 72, r: 4, cx: 60, cy: 270, stack: 'v' },
  { id: 'fender_lr', label: 'Left rear fender', shape: 'rect', x: 44, y: 310, w: 46, h: 66, r: 10, cx: 72, cy: 343, stack: 'v' },
  { id: 'fender_rf', label: 'Right front fender', shape: 'rect', x: 210, y: 84, w: 46, h: 66, r: 10, cx: 228, cy: 117, stack: 'v' },
  { id: 'door_rf', label: 'Right front door', shape: 'rect', x: 210, y: 154, w: 46, h: 76, r: 4, cx: 240, cy: 192, stack: 'v' },
  { id: 'door_rr', label: 'Right rear door', shape: 'rect', x: 210, y: 234, w: 46, h: 72, r: 4, cx: 240, cy: 270, stack: 'v' },
  { id: 'fender_rr', label: 'Right rear fender', shape: 'rect', x: 210, y: 310, w: 46, h: 66, r: 10, cx: 228, cy: 343, stack: 'v' },

  { id: 'mirror_l', label: 'Left side mirror', shape: 'rect', x: 91, y: 147, w: 14, h: 10, r: 4, cx: 98, cy: 152, hit: 6 },
  { id: 'mirror_r', label: 'Right side mirror', shape: 'rect', x: 195, y: 147, w: 14, h: 10, r: 4, cx: 202, cy: 152, hit: 6 },

  { id: 'wheel_lf', label: 'Left front wheel', kind: 'wheel', shape: 'circle', rad: 20, cx: 34, cy: 117, stack: 'v' },
  { id: 'wheel_lr', label: 'Left rear wheel', kind: 'wheel', shape: 'circle', rad: 20, cx: 34, cy: 343, stack: 'v' },
  { id: 'wheel_rf', label: 'Right front wheel', kind: 'wheel', shape: 'circle', rad: 20, cx: 266, cy: 117, stack: 'v' },
  { id: 'wheel_rr', label: 'Right rear wheel', kind: 'wheel', shape: 'circle', rad: 20, cx: 266, cy: 343, stack: 'v' },
]

export const zoneById = Object.fromEntries(ZONES.map((z) => [z.id, z]))
