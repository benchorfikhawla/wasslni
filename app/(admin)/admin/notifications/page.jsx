/* 'use client';

import React from 'react';
import NotificationInbox from '@/app/notfication/NotificationInbox';

export default function AdminNotificationsPage({ params }) {
    // Pour les admins, on peut passer null pour managerEstablishmentId 
    // pour qu'ils voient tous les incidents/notifications
    const adminId = params.adminId || 1; // À remplacer par l'ID réel de l'admin connecté
    const adminEstablishmentId = params.adminEstablishmentId || null; // null pour voir tout

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-default-900">Notifications & Incidents</h1>
                    <p className="text-default-600">Gérez toutes les notifications et incidents du système.</p>
                </div>
            </div>

            <NotificationInbox
                managerId={adminId}
                managerEstablishmentId={adminEstablishmentId}
            />
        </div>
    );
}  */
 
    'use client';
    import React, { useState, useEffect, useCallback } from 'react';
    
    // Services
    import {
      getAllIncidents,
      getNotfication,
      markNotificationAsRead
    } from '@/services/notficationicidient';
    
    // UI Components
    import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
      CardDescription
    } from "@/components/ui/card";
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow
    } from "@/components/ui/table";
    import { Icon } from '@iconify/react';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { cn } from '@/lib/utils';
    import toast from 'react-hot-toast';
    import DatePickerWithRange from "@/components/date-picker-with-range";
    import { Badge } from "@/components/ui/badge";
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select";
    import {
      Tabs,
      TabsContent,
      TabsList,
      TabsTrigger
    } from "@/components/ui/tabs";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { MangmentNotificationsList } from './MangmentNotificationsList';
    import { ModalIncidentDetails } from './ModalIncidentDetails'; // Vérifiez le chemin
    
 
const ITEMS_PER_PAGE_INCIDENTS = 10;

export default function IncidentsNotificationsPage() {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentTab, setCurrentTab] = useState('incidents');
  const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
  const [incidentDateRange, setIncidentDateRange] = useState(null);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
  const [incidentCurrentPage, setIncidentCurrentPage] = useState(1);
  const [isIncidentDetailsModalOpen, setIsIncidentDetailsModalOpen] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState(null);

  const refreshIncidentsAndNotifications = useCallback(async () => {
    try {
      const [incidentsRes, notificationsRes] = await Promise.all([
        getAllIncidents(),
        getNotfication()
      ]);
      setIncidents(incidentsRes || []);
      setFilteredIncidents(incidentsRes || []);
      setNotifications(notificationsRes || []);
      setIncidentCurrentPage(1);
    } catch (error) {
      console.error('Erreur:', error.message);
      toast.error("Erreur lors du chargement");
    }
  }, []);

  useEffect(() => {
    refreshIncidentsAndNotifications();
  }, [refreshIncidentsAndNotifications]);

  useEffect(() => {
    let temp = [...incidents];

    if (incidentStatusFilter !== 'all') {
      temp = temp.filter(inc => inc.status === incidentStatusFilter);
    }

    if (incidentDateRange?.from) {
      const fromDate = new Date(incidentDateRange.from);
      const toDate = incidentDateRange.to ? new Date(incidentDateRange.to) : fromDate;
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      temp = temp.filter(inc => {
        const date = new Date(inc.timestamp);
        return date >= fromDate && date <= toDate;
      });
    }

    if (incidentSearchTerm) {
      const search = incidentSearchTerm.toLowerCase();
      temp = temp.filter(inc =>
        inc.description?.toLowerCase().includes(search) ||
        inc.reportedBy?.fullname?.toLowerCase().includes(search) ||
        inc.dailyTrip?.trip?.name?.toLowerCase().includes(search)
      );
    }

    setFilteredIncidents(temp);
    const totalPages = Math.ceil(temp.length / ITEMS_PER_PAGE_INCIDENTS);
    if (totalPages > 0 && incidentCurrentPage > totalPages) {
      setIncidentCurrentPage(totalPages);
    } else if (temp.length === 0 && incidentCurrentPage !== 1) {
      setIncidentCurrentPage(1);
    }
  }, [
    incidents,
    incidentSearchTerm,
    incidentDateRange,
    incidentStatusFilter,
    incidentCurrentPage
  ]);

  const paginatedIncidents = filteredIncidents.slice(
    (incidentCurrentPage - 1) * ITEMS_PER_PAGE_INCIDENTS,
    incidentCurrentPage * ITEMS_PER_PAGE_INCIDENTS
  );

  const handleIncidentPageChange = (page) => setIncidentCurrentPage(page);

  const handleMarkNotificationAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      toast.success("Marquée comme lue");
    } catch {
      toast.error("Échec de mise à jour");
    }
  };

  const handleViewIncidentDetails = (incident) => {
    setSelectedIncidentDetails(incident);
    setIsIncidentDetailsModalOpen(true);
  };

  const getIncidentStatusText = (status) => ({
    NEW: 'Nouveau',
    ACKNOWLEDGED: 'Reconnu',
    RESOLVED: 'Résolu'
  }[status] || 'Inconnu');

  const getIncidentStatusColor = (status) => ({
    NEW: 'red',
    ACKNOWLEDGED: 'yellow',
    RESOLVED: 'green'
  }[status] || 'gray');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Incidents & Notifications</h1>
      <p>Gestion des incidents et consultation des notifications.</p>
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="incidents">Incidents Signalés</TabsTrigger>
          <TabsTrigger value="notifications">Mes Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Incidents</CardTitle>
              <CardDescription>{filteredIncidents.length} résultats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4 flex-wrap">
                <Input placeholder="Rechercher..." value={incidentSearchTerm} onChange={(e) => setIncidentSearchTerm(e.target.value)} />
                <Select value={incidentStatusFilter} onValueChange={setIncidentStatusFilter}>
                  <SelectTrigger><SelectValue placeholder="Filtrer..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="NEW">Nouveau</SelectItem>
                    <SelectItem value="ACKNOWLEDGED">Reconnu</SelectItem>
                    <SelectItem value="RESOLVED">Résolu</SelectItem>
                  </SelectContent>
                </Select>
                <DatePickerWithRange date={incidentDateRange} setDate={setIncidentDateRange} />
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Trajet</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Rapporté par</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Signalement</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedIncidents.length > 0 ? paginatedIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.description}</TableCell>
                        <TableCell>{incident.dailyTrip?.trip?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(incident.dailyTrip?.date).toLocaleDateString()}</TableCell>
                        <TableCell>{incident.reportedBy?.fullname || 'Inconnu'}</TableCell>
                        <TableCell>
                          <Badge color={getIncidentStatusColor(incident.status)}>
                            {getIncidentStatusText(incident.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(incident.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => handleViewIncidentDetails(incident)}>
                            <Icon icon="heroicons:eye" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={7} className="text-center">Aucun incident</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>

              {totalIncidentPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <Button disabled={incidentCurrentPage === 1} onClick={() => handleIncidentPageChange(incidentCurrentPage - 1)}>Précédent</Button>
                  {Array.from({ length: totalIncidentPages }, (_, i) => (
                    <Button key={i} variant={incidentCurrentPage === i + 1 ? "default" : "outline"} onClick={() => handleIncidentPageChange(i + 1)}>{i + 1}</Button>
                  ))}
                  <Button disabled={incidentCurrentPage === totalIncidentPages} onClick={() => handleIncidentPageChange(incidentCurrentPage + 1)}>Suivant</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <MangmentNotificationsList
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </TabsContent>
      </Tabs>

      {isIncidentDetailsModalOpen && (
        <ModalIncidentDetails
          isOpen={isIncidentDetailsModalOpen}
          setIsOpen={setIsIncidentDetailsModalOpen}
          incidentDetails={selectedIncidentDetails}
        />
      )}
    </div>
  );
}
