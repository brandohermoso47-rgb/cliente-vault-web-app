import * as THREE from 'three';

export function buildDiscoBall(THREE_IN) {
  const T = THREE_IN || THREE;

  const mirror = new T.MeshStandardMaterial({
    name: 'chrome_mirror', color: 0xe8ecf2, metalness: 0.38, roughness: 0.10
  });
  const mirrorWarm = new T.MeshStandardMaterial({
    name: 'chrome_mirror_warm', color: 0xc9d2dc, metalness: 0.36, roughness: 0.16
  });
  const core = new T.MeshStandardMaterial({
    name: 'ball_core', color: 0x15161a, metalness: 0.2, roughness: 0.7
  });
  const steel = new T.MeshStandardMaterial({
    name: 'steel_fitting', color: 0xa9aeb6, metalness: 0.4, roughness: 0.28
  });
  const cordMat = new T.MeshStandardMaterial({
    name: 'cord', color: 0x3a3d44, metalness: 0.1, roughness: 0.85
  });

  const group = new T.Group();
  group.name = 'disco_ball';

  const R = 0.25;

  const sphere = new T.Mesh(new T.SphereGeometry(R * 0.985, 48, 32), core);
  sphere.name = 'core_sphere';
  group.add(sphere);

  // Mirror tiles laid in latitude bands
  const bands = 20;
  const tileGeoCache = {};
  let n = 0;
  for (let b = 0; b < bands; b++) {
    const phi = ((b + 0.5) / bands) * Math.PI;      // 0..PI from north pole
    const y = R * Math.cos(phi);
    const ringR = R * Math.sin(phi);
    const bandH = (Math.PI * R) / bands * 0.86;
    const count = Math.max(4, Math.round((2 * Math.PI * ringR) / (bandH * 1.02)));
    const tileW = ((2 * Math.PI * ringR) / count) * 0.86;
    const key = tileW.toFixed(4) + '_' + bandH.toFixed(4);
    if (!tileGeoCache[key]) tileGeoCache[key] = new T.BoxGeometry(tileW, bandH, 0.006);

    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + (b % 2 ? Math.PI / count : 0);
      const tile = new T.Mesh(tileGeoCache[key], (b + i) % 5 === 0 ? mirrorWarm : mirror);
      tile.name = 'mirror_tile_' + (++n);
      const nx = Math.sin(phi) * Math.cos(theta);
      const nz = Math.sin(phi) * Math.sin(theta);
      const ny = Math.cos(phi);
      tile.position.set(nx * (R + 0.0035), ny * (R + 0.0035), nz * (R + 0.0035));
      tile.lookAt(nx * (R + 1), ny * (R + 1), nz * (R + 1));
      group.add(tile);
    }
  }

  // Top fitting: cap, eyelet ring, cord
  const cap = new T.Mesh(new T.CylinderGeometry(0.028, 0.036, 0.026, 32), steel);
  cap.name = 'top_cap';
  cap.position.y = R + 0.010;
  group.add(cap);

  const ring = new T.Mesh(new T.TorusGeometry(0.020, 0.0045, 16, 40), steel);
  ring.name = 'hang_ring';
  ring.position.y = R + 0.040;
  ring.rotation.y = Math.PI / 2;
  group.add(ring);

  const cord = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.22, 12), cordMat);
  cord.name = 'hang_cord';
  cord.position.y = R + 0.060 + 0.11;
  group.add(cord);

  const mount = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.012, 32), steel);
  mount.name = 'ceiling_mount';
  mount.position.y = R + 0.060 + 0.22 + 0.006;
  group.add(mount);

  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // rest base at y = 0
  const box = new T.Box3().setFromObject(group);
  group.position.y -= box.min.y;
  return group;
}
