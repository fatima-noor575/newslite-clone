"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFarms, createFarm, deleteFarm } from "@/services/farms";
import { useState } from "react"; import { toast } from "sonner";

export default function Farms() {
  const qc = useQueryClient();
  const { data: farms = [] } = useQuery({ queryKey: ["farms"], queryFn: listFarms });
  const [form, setForm] = useState({ name:"", location:"", area:0, soil_type:"loamy" });
  const create = useMutation({ mutationFn: () => createFarm(form),
    onSuccess: () => { qc.invalidateQueries({queryKey:["farms"]}); toast.success("Farm added"); }});
  const del = useMutation({ mutationFn: (id:number)=>deleteFarm(id),
    onSuccess:()=>qc.invalidateQueries({queryKey:["farms"]}) });

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Farms</h1>
      <form onSubmit={e=>{e.preventDefault();create.mutate();}} className="grid md:grid-cols-5 gap-2 mb-6">
        <input className="border rounded px-3 py-2 bg-transparent" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="border rounded px-3 py-2 bg-transparent" placeholder="lat,lon" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
        <input type="number" className="border rounded px-3 py-2 bg-transparent" placeholder="Area (acres)" value={form.area} onChange={e=>setForm({...form,area:+e.target.value})}/>
        <select className="border rounded px-3 py-2 bg-transparent" value={form.soil_type} onChange={e=>setForm({...form,soil_type:e.target.value})}>
          <option>loamy</option><option>sandy</option><option>clay</option><option>silty</option>
        </select>
        <button className="rounded bg-agro-600 text-white">Add</button>
      </form>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-900"><tr><th className="p-2 text-left">Name</th><th>Location</th><th>Area</th><th>Soil</th><th></th></tr></thead>
          <tbody>{farms.map(f=>(<tr key={f.id} className="border-t"><td className="p-2">{f.name}</td><td className="text-center">{f.location||"—"}</td><td className="text-center">{f.area||"—"}</td><td className="text-center">{f.soil_type||"—"}</td><td><button onClick={()=>del.mutate(f.id)} className="text-red-600 text-xs">Delete</button></td></tr>))}</tbody>
        </table>
      </div>
    </AppShell>
  );
}
