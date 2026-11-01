#!/usr/bin/env python3
"""DH-11C.4B: Import the authoritative cabinet GLB, save an editable Blender
master, then export a new GLB. Run only with Blender's bundled Python:
 blender --background --factory-startup --python scripts/blender/dh11c_cabinet_roundtrip.py \
   -- --input input.glb --blend cabinet.blend --output cabinet-blender.glb --report export.json

The Node-defined geometry is the first source of truth. Blender is the editable
modelling stage; never reconstruct perspective-critical parts from pictures.
"""
import argparse
import hashlib
import json
import os
import sys

import bpy

DRAWERS = ("finished", "drafts", "oddities", "fragments", "field_notes")
REQUIRED = (
    "cabinet_root", "cabinet_case", "cabinet_rails",
    "case_back", "case_left", "case_right", "case_top", "case_bottom",
)
for slug in DRAWERS:
    REQUIRED += (
        "cabinet_slot_" + slug, "drawer_" + slug,
        "drawer_front_" + slug, "tray_" + slug,
        "tray_floor_" + slug, "tray_left_" + slug,
        "tray_right_" + slug, "tray_rear_" + slug,
        "folders_" + slug, "track_left_" + slug,
        "track_right_" + slug, "brass_handle_" + slug,
        "label_plate_" + slug,
    )
    for i in range(4):
        REQUIRED += ("folder_" + slug + "_" + str(i),)


def sha256(path):
    with open(path, "rb") as stream:
        return hashlib.sha256(stream.read()).hexdigest()


def validate_import():
    missing = [name for name in REQUIRED if bpy.data.objects.get(name) is None]
    if missing:
        raise ValueError("Blender lost required cabinet nodes: " + ", ".join(missing))
    case = bpy.data.objects["cabinet_case"]
    root = bpy.data.objects["cabinet_root"]
    if case.parent is not root:
        raise ValueError("Cabinet case is detached from root")
    for slug in DRAWERS:
        drawer = bpy.data.objects["drawer_" + slug]
        front = bpy.data.objects["drawer_front_" + slug]
        tray = bpy.data.objects["tray_" + slug]
        folder = bpy.data.objects["folders_" + slug]
        if drawer.parent is not root:
            raise ValueError("Drawer detached from cabinet_root: " + slug)
        if any(item.parent is not drawer for item in (front, tray, folder)):
            raise ValueError("Drawer components do not share moving parent: " + slug)
        # In Blender Z-up, the imported drawer travel axis is a transformed
        # local axis. World coordinates are verified by the exported GLB test.
        if drawer.type != "EMPTY":
            raise ValueError("Drawer must be a moving transform (EMPTY): " + slug)
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    if not meshes:
        raise ValueError("No editable cabinet mesh objects")
    if any(len(obj.data.vertices) == 0 or len(obj.data.polygons) == 0 for obj in meshes):
        raise ValueError("Degenerate cabinet geometry")
    return meshes


def main():
    parser = argparse.ArgumentParser(description="Blender cabinet modelling round-trip")
    parser.add_argument("--input", required=True)
    parser.add_argument("--blend", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    for target in (args.blend, args.output, args.report):
        os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
    if os.path.abspath(args.input) == os.path.abspath(args.output):
        raise ValueError("Never overwrite the authoritative input GLB")
    if not os.path.isfile(args.input):
        raise FileNotFoundError(args.input)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(args.input))
    meshes = validate_import()

    scene = bpy.context.scene
    scene.name = "Manuscript Hoard Cabinet | DH-11C.4B"
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene["davehub_adr"] = "ADR-0012"
    scene["davehub_milestone"] = "DH-11C.4B"
    scene["davehub_model_status"] = "geometry only, visual approval pending"
    scene["davehub_source_glb_sha256"] = sha256(args.input)
    scene["davehub_drawer_axis_export"] = "+Z (glTF Y-up)"
    scene["davehub_travel_metres"] = 0.76
    # This is a modelling/export pipeline; no render-engine selection is needed.
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend), check_existing=False, compress=True)

    # Preserve independent glTF child nodes and the imported UV0/material
    # data. Do not apply arbitrary object-specific corrective rotations.
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(args.output),
        export_format="GLB",
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        use_selection=False,
    )

    report = {
        "milestone": "DH-11C.4B",
        "blenderVersion": bpy.app.version_string,
        "sourceSha256": sha256(args.input),
        "exportSha256": sha256(args.output),
        "editableBlendSha256": sha256(args.blend),
        "meshCount": len(meshes),
        "objectCount": len(bpy.data.objects),
        "requiredNodeCount": len(REQUIRED),
        "meshNames": sorted(obj.name for obj in meshes),
        "drawerNames": ["drawer_" + slug for slug in DRAWERS],
        "importAndReexport": True,
        "styleApproved": False,
    }
    with open(args.report, "w", encoding="utf-8") as output:
        json.dump(report, output, indent=2, sort_keys=True)
        output.write("\n")
    print("PASS DH-11C.4B Blender source + exported GLB, meshes:", len(meshes))
    print("PASS GLB sha256:", report["exportSha256"])
    print("PASS editable blend:", args.blend)


if __name__ == "__main__":
    main()
