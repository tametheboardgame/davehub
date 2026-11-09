#!/usr/bin/env python3
"""DH-11C.4E: import the authored room shell GLB into Blender, save an editable
.blend source master, then export a fresh glTF model using Blender's own exporter.
Geometry remains sourced from one validated set of world-space coordinates.
"""
import argparse
import hashlib
import json
import os
import sys

import bpy

REQUIRED = (
 "room_shell_root", "floor_substrate", "wall_left",
 "wall_back-left", "wall_back-right", "wall_back-sill", "wall_back-header",
 "wall_right-rear", "wall_right-front", "wall_right-lintel",
 "window_reveal_vertical_0", "window_reveal_vertical_1",
 "window_reveal_horizontal_0", "window_reveal_horizontal_1",
 "corridor_floor", "corridor_back", "corridor_ceiling",
 "rug", "ceiling_beam_0",
)

def digest(file):
 with open(file,"rb") as f:
  return hashlib.sha256(f.read()).hexdigest()

def main():
 parser=argparse.ArgumentParser()
 for flag in ("input","blend","output","report"):
  parser.add_argument("--"+flag,required=True)
 args=parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
 if os.path.abspath(args.input)==os.path.abspath(args.output):
  raise ValueError("Source GLB and Blender output cannot be the same file")
 for filename in (args.output,args.blend,args.report):
  os.makedirs(os.path.dirname(os.path.abspath(filename)),exist_ok=True)
 bpy.ops.object.select_all(action="SELECT")
 bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=os.path.abspath(args.input))
 missing=[n for n in REQUIRED if bpy.data.objects.get(n) is None]
 if missing:
  raise ValueError("Missing room-shell nodes: "+",".join(missing))
 meshes=[obj for obj in bpy.data.objects if obj.type=="MESH"]
 if len(meshes)<50:
  raise ValueError("Incomplete room shell model, only "+str(len(meshes))+" meshes")
 root=bpy.data.objects["room_shell_root"]
 if any(obj.parent is not root for obj in meshes):
  raise ValueError("Architectural mesh detached from shared room root")
 for obj in meshes:
  if not obj.data.vertices or not obj.data.polygons:
   raise ValueError("Degenerate building mesh "+obj.name)
 bpy.context.scene.name="The Manuscript Hoard - Architectural Shell"
 bpy.context.scene.unit_settings.system="METRIC"
 bpy.context.scene.unit_settings.scale_length=1.0
 bpy.context.scene["davehub_adr"]="ADR-0012"
 bpy.context.scene["davehub_phase"]="DH-11C.4E"
 bpy.context.scene["davehub_asset"]="room-shell"
 bpy.context.scene["davehub_visual_approval"]="pending"
 bpy.context.scene["source_sha256"]=digest(args.input)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend),compress=True,check_existing=False)
 bpy.ops.export_scene.gltf(filepath=os.path.abspath(args.output),export_format="GLB",
    export_yup=True,export_texcoords=True,export_normals=True,
    export_materials="EXPORT",use_selection=False)
 summary={
  "milestone":"DH-11C.4E",
  "sourceSha256":digest(args.input),
  "blendSha256":digest(args.blend),
  "exportSha256":digest(args.output),
  "blenderVersion":bpy.app.version_string,
  "meshCount":len(meshes),
  "nodeNames":sorted(obj.name for obj in bpy.data.objects),
  "originalRoomCameraUnchanged":True,
  "visualApproval":False,
 }
 with open(args.report,"w",encoding="utf-8") as f:json.dump(summary,f,indent=2,sort_keys=True)
 print("PASS DH-11C.4E Blender room-shell export",summary["meshCount"],"meshes")
 print("PASS model sha256:",summary["exportSha256"])

if __name__=="__main__":
 main()
