#!/usr/bin/env python3
"""DH-11C.4F: genuine Blender source master of all moving writing-room furniture.
Import one physically coherent GLB, retain every interactive parent transform,
save editable .blend and export a separate GLB for validation.
"""
import argparse
import hashlib
import json
import os
import sys
import bpy

ROOTS=("desk_root","typewriter_root","bookcase_root","bin_root","door_root","window_root")
MOVERS=("desk_paper_00","desk_paper_01","book_0_00","book_1_00",
        "typewriter_key_1_4","door_leaf_hinge","window_island_0",
        "window_island_1","window_island_2","bin_paper_0")
def sha(file):
 with open(file,"rb") as f:return hashlib.sha256(f.read()).hexdigest()
def main():
 parser=argparse.ArgumentParser()
 for field in ("input","blend","output","report"):parser.add_argument("--"+field,required=True)
 args=parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
 if os.path.abspath(args.input)==os.path.abspath(args.output):
  raise ValueError("Never overwrite input geometry")
 for f in (args.blend,args.output,args.report):os.makedirs(os.path.dirname(os.path.abspath(f)),exist_ok=True)
 bpy.ops.object.select_all(action="SELECT")
 bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=os.path.abspath(args.input))
 required=("furniture_root",)+ROOTS+MOVERS
 missing=[name for name in required if bpy.data.objects.get(name) is None]
 if missing:raise ValueError("Missing named furniture rig nodes: "+", ".join(missing))
 root=bpy.data.objects["furniture_root"]
 if any(bpy.data.objects[name].parent is not root for name in ROOTS):
  raise ValueError("Furniture root hierarchy was changed")
 for name in MOVERS:
  obj=bpy.data.objects[name]
  if name.startswith("door_") and obj.parent is not bpy.data.objects["door_root"]:
   raise ValueError("Hinged door pivot detached")
  if name.startswith("window_island_") and obj.parent is not bpy.data.objects["window_root"]:
   raise ValueError("Floating island pivot detached")
 meshes=[obj for obj in bpy.data.objects if obj.type=="MESH"]
 if len(meshes)<170 or any(not obj.data.vertices or not obj.data.polygons for obj in meshes):
  raise ValueError("Incomplete furniture meshes: "+str(len(meshes)))
 bpy.context.scene.name="The Manuscript Hoard - Interactive Furniture"
 bpy.context.scene.unit_settings.system="METRIC"
 bpy.context.scene.unit_settings.scale_length=1.0
 bpy.context.scene["davehub_phase"]="DH-11C.4F"
 bpy.context.scene["davehub_adr"]="ADR-0012"
 bpy.context.scene["visual_approval"]="pending"
 bpy.context.scene["source_glb_sha256"]=sha(args.input)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend),compress=True,check_existing=False)
 bpy.ops.export_scene.gltf(filepath=os.path.abspath(args.output),export_format="GLB",export_yup=True,
  export_texcoords=True,export_normals=True,export_materials="EXPORT",use_selection=False)
 result={"milestone":"DH-11C.4F","blenderVersion":bpy.app.version_string,
  "sourceSha256":sha(args.input),"blendSha256":sha(args.blend),"exportSha256":sha(args.output),
  "meshCount":len(meshes),"nodeNames":sorted(obj.name for obj in bpy.data.objects),
  "interactiveRoots":ROOTS,"movingNodes":MOVERS,"approvedStyle":False}
 with open(args.report,"w",encoding="utf-8") as f:json.dump(result,f,indent=2,sort_keys=True)
 print("PASS DH-11C.4F editable Blender furniture:",len(meshes),"meshes")
 print("PASS export",result["exportSha256"])
if __name__=="__main__":main()
