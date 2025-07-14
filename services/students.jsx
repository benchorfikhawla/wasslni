 
import axios from 'axios';
import { getToken, isAuthenticated } from '@/utils/auth'; // Assurez-vous que ces utilitaires existent

const API_URL = process.env.NEXT_PUBLIC_SITE_URL; // Doit pointer vers votre backend

// Configure Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion centralisée des erreurs
const handleApiError = (error) => {
  let errorMessage = 'Erreur de connexion au serveur';

  if (error.response) {
    console.error('API Error:', error.response.data);
    errorMessage = error.response.data.error || error.response.data.message || 'Erreur serveur';
  } else if (error.request) {
    console.error('No response from server');
    errorMessage = 'Le serveur ne répond pas';
  } else {
    console.error('Request error:', error.message);
  }

  throw new Error(errorMessage);
};
// ==============================
// Fonctions CRUD pour les étudiants
// ==============================

export async function fetchAllStudents(filters = {}) {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/students/students', { params: filters });
    console.log('Données des students reçues:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des students:', error);
    throw error;
  }
}

export async function createStudent(StudentData) {
  const response = await axiosInstance.post('/students/', StudentData);
  return response.data;
}
export async function createAssignation(StudentData) {
  const response = await axiosInstance.post('/parentstudent/', StudentData);
  return response.data;
}
export async function removeAssignation(studentId, parentId) {
  const response = await axiosInstance.delete(`/parentstudent/${studentId}/${parentId}`);
  return response.data;
}
export async function updateStudent(id,StudentData) {
  const response = await axiosInstance.put(`/students/${id}`, StudentData);
  return response.data;
}
export async function deleteStudent(id) {
  const response = await axiosInstance.delete(`/students/${id}/delete-permanently/`);
  return response.data;
}

export async function studentbyetablishment(establishmentId ) {
  const response = await axiosInstance.get(`/students/${establishmentId}/students`);
  return response.data;
}



/**
 * 🔐 Obtenir les étudiants accessibles à l'utilisateur connecté
 */
export const getStudentsByUser = async (filters = {}) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/students/', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants de l'utilisateur:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📄 Obtenir un étudiant par ID
 */
export const getStudentById = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get(`/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🧾 Obtenir les détails d’un étudiant avec vérification d’accès (pour utilisateur connecté)
 */
export const getStudentDetailsById = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get(`/students/${studentId}/details`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};



/**
 * 🗑️ Supprimer doucement un étudiant (soft delete)
 */
export const softDeleteStudent = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.patch(`/students/${studentId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression douce de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🔁 Restaurer un étudiant supprimé
 */
export const restoreStudent = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.patch(`/students/${studentId}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la restauration de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};



/**
 * 🚨 Envoyer une demande de suppression d'un étudiant à un administrateur
 */
export const requestStudentDeletion = async (studentId, reason) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.post(`/students/${studentId}/request-delete`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l’envoi de la demande de suppression de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🔍 Rechercher des étudiants (par nom, quartier, classe, etc.)
 */
export const searchStudents = async (query, filters = {}) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const params = { query, ...filters };
    const response = await axiosInstance.get('/students/search', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche des étudiants:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📊 Récupérer les statistiques des étudiants
 */
export const getStudentStatistics = async (filters = {}) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/students/statistics', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📈 Récupérer les statistiques détaillées d’un étudiant (présences/absences)
 */
export const getStudentStats = async (studentId, tripId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const params = tripId ? { tripId } : {};
    const response = await axiosInstance.get(`/students/${studentId}/statistic`, { params });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

