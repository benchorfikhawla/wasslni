// components/models/ModalTrip.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {studentbyetablishment} from '@/services/students';



export const ModalTrip = ({ isOpen, onClose, editingTrip, onSave, routes, buses, drivers, establishments,tripStudents }) => {
  const [formData, setFormData] = useState({
    name: '',
    routeId: null,
    busId: null,
    driverId: null,
    establishmentId: null,
    studentIds: [], // For linking students to this trip
  });
  console.log("drivers",drivers)
   const [students, setStudents] = useState([]);
     const [loadingStudents, setLoadingStudents] = useState(false);
     const[filteredRoutes,setFilteredRoute] = useState([]);
     const[filteredBuses,setFiilteredBuses] = useState([]);
    const[filteredDrivers,setFilteredDrivers] = useState([]);
       console.log("drivers",drivers)

  useEffect(() => {
    if (editingTrip) {
      console.log("edit trip fourni",editingTrip);
      const linkedStudentIds = editingTrip.tripStudents.map(ts => ts.studentId);
      console.log("link student",linkedStudentIds)
      setFormData({
        name: editingTrip.name || '',
        routeId: editingTrip.routeId || null,
        busId: editingTrip.busId || null,
        driverId: editingTrip.driverId || null,
        establishmentId: editingTrip.establishmentId || null,
        studentIds: linkedStudentIds,
      });
    } else {
      setFormData({
        name: '',
        routeId: null,
        busId: null,
        driverId: null,
        establishmentId: null,
        studentIds: [],
      });
    }
  }, [editingTrip, tripStudents]);
  console.log(formData.establishmentId);
  useEffect(() => {
  const loadStudentsForEstablishment = async () => {
    if (!formData.establishmentId) {
      setStudents([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const data = await studentbyetablishment(formData.establishmentId);
      setStudents(data);
    } catch (err) {
      console.error('Erreur lors du chargement des élèves', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // --- Nouveau : Filtrer les routes et les bus ---
  const filterRoutes = routes.filter(
    route => route.establishmentId === formData.establishmentId
  );
   const finalRoutes = filterRoutes.length > 0 ? filterRoutes : [];

  setFilteredRoute(finalRoutes);

  const filterBuses = buses.filter(
    bus => bus.establishmentId === formData.establishmentId
  );
  const finalBus = filterBuses.length > 0 ? filterBuses :[];
  setFiilteredBuses(finalBus)

  const filterDrivers= drivers.filter(driver =>
    driver.establishmentsLink?.some(
      link => link.establishmentId === formData.establishmentId
    )
  );
  const finalDrivers = filterDrivers.length > 0 ? filterDrivers : [];
 setFilteredDrivers(finalDrivers)
  // Si l'établissement change, on remet à zéro routeId et busId pour éviter des valeurs invalides
  if (filterRoutes.length === 0 && formData.routeId !== null) {
    setFormData(prev => ({ ...prev, routeId: null }));
  }

  if (filterBuses.length === 0 && formData.busId !== null) {
    setFormData(prev => ({ ...prev, busId: null }));
  }
    if (filterDrivers.length === 0 && formData.driverId !== null) {
    setFormData(prev => ({ ...prev, driverId: null }));
  }
 console.log("filtered",filterDrivers)
  // -----------------------------------------------

  loadStudentsForEstablishment();
}, [formData.establishmentId, routes, buses,drivers]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleStudentCheckboxChange = (id, checked) => {
    setFormData(prev => {
      const newStudentIds = checked
        ? [...prev.studentIds, id]
        : prev.studentIds.filter(studentId => studentId !== id);
      return { ...prev, studentIds: newStudentIds };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation to ensure required fields are selected/filled
    if (!formData.name || !formData.routeId || !formData.busId || !formData.driverId || !formData.establishmentId) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }
    onSave(formData);
  };
 console.log("fromdata students",formData.studentIds);
 console.log("formdata",formData)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="px-6">
          <DialogTitle className="text-base font-medium text-default-700 ">
            {editingTrip ? 'Modifier le Trajet' : 'Ajouter un nouveau Trajet'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 px-6 max-h-[70vh] overflow-y-auto">
          <div>
            <Label htmlFor="name" className="text-right">Nom du Trajet</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
          </div>
           {/* Establishment Selection (assuming a trip belongs to one establishment) */}
          {establishments && establishments.length > 0 && (
            <div>
              <Label htmlFor="establishment" className="text-right">Établissement</Label>
              <Select onValueChange={(value) => handleSelectChange('establishmentId', value)} value={formData.establishmentId ? String(formData.establishmentId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent  >
                <ScrollArea className="h-[100px]">
                  {establishments.map(est => (
                    <SelectItem key={est.id} value={String(est.id)}>
                      {est.name}
                    </SelectItem>
                  ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Route Selection */}
        <div>
  <Label htmlFor="route" className="text-right">Route</Label>

  {routes && routes.length > 0 ? (
    <Select
      onValueChange={(value) => handleSelectChange('routeId', value)}
      value={formData.routeId ? String(formData.routeId) : ''}
      required
    >
      <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Sélectionner une route" />
      </SelectTrigger>
      <SelectContent  >
      <ScrollArea className="max-h-[100px]">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(route => (
            <SelectItem key={route.id} value={String(route.id)}>
              {route.name}
            </SelectItem>
          ))
        ) : (
          <div className="text-sm text-gray-500 px-4 py-2">Aucune route disponible pour cet établissement.</div>
        )}
        </ScrollArea>
      </SelectContent>
    </Select>
  ) : (
    <p className="text-sm text-gray-500 mt-2">Aucune route disponible.</p>
  )}
</div>


          {/* Bus Selection */}
         {buses && buses.length > 0 && (
         <div>
          <Label htmlFor="bus" className="text-right">Bus</Label>
          <Select 
           onValueChange={(value) => handleSelectChange('busId', value)} 
           value={formData.busId ? String(formData.busId) : ''} 
           required
          >
           <SelectTrigger className="col-span-3">
           <SelectValue placeholder="Sélectionner un bus" />
           </SelectTrigger>
          <SelectContent >
          <ScrollArea className="h-[100px]">
           {filteredBuses.length === 0 ? (
             <p className="text-sm text-gray-500 pl-2">Aucun bus disponible pour cet établissement.</p>
              ) : (
             filteredBuses.map(bus => (
            <SelectItem key={bus.id} value={String(bus.id)}>
              {bus.plateNumber} ({bus.marque})
            </SelectItem>
           ))
          )}
          </ScrollArea>
         </SelectContent>
         </Select>
       </div>
 
)}

          {/* Driver Selection */}
          {drivers && drivers.length > 0 && (
  <div>
    <Label htmlFor="driver" className="text-right">Chauffeur</Label>
    <Select 
      onValueChange={(value) => handleSelectChange('driverId', value)} 
      value={formData.driverId ? String(formData.driverId) : ''} 
      required
    >
      <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Sélectionner un chauffeur" />
      </SelectTrigger>
      <SelectContent>
      <ScrollArea className="h-[100px]">
        {filteredDrivers.length === 0 ? (
          <p className="text-sm text-gray-500 pl-2">Aucun chauffeur disponible pour cet établissement.</p>
        ) : (
          filteredDrivers.map(driver => (
            <SelectItem key={driver.id} value={String(driver.id)}>
              {driver.fullname}
            </SelectItem>
          ))
        )}
        </ScrollArea>
      </SelectContent>
    </Select>
  </div>
)}

         

          {/* Students Multi-Selection */}
          {students && students.length > 0 && (
            <div>
              <Label className="text-right mt-2">Élèves Associés</Label>
              <ScrollArea className="col-span-3 space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={formData.studentIds.includes(student.id)}
                      onCheckedChange={(checked) => handleStudentCheckboxChange(student.id, checked)}
                    />
                    <Label htmlFor={`student-${student.id}`}>{student.fullname}</Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};