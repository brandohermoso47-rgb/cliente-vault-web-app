import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // RFC 3339 timestamp
  completed?: string; // RFC 3339 timestamp
  updated?: string;
  selfLink?: string;
  position?: string;
}

// Google Auth Provider configured with Google Tasks scopes
export const tasksAuthProvider = new GoogleAuthProvider();
tasksAuthProvider.addScope('https://www.googleapis.com/auth/tasks');
tasksAuthProvider.addScope('https://www.googleapis.com/auth/tasks.readonly');
tasksAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

let cachedTasksAccessToken: string | null = null;

export const setTasksAccessToken = (token: string | null) => {
  cachedTasksAccessToken = token;
};

export const getTasksAccessToken = (): string | null => {
  return cachedTasksAccessToken;
};

/**
 * Sign in user with Google to grant Google Tasks permissions
 */
export const signInForGoogleTasks = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, tasksAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Tasks.');
    }
    cachedTasksAccessToken = credential.accessToken;
    return cachedTasksAccessToken;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('La ventana de autenticación fue cerrada por el usuario.');
    }
    console.error('Error al iniciar sesión con Google Tasks:', error);
    throw error;
  }
};

/**
 * Fetch user's task lists from Google Tasks
 */
export const listTaskLists = async (token?: string): Promise<GoogleTaskList[]> => {
  const activeToken = token || cachedTasksAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Tasks.');
  }

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al obtener listas de tareas de Google Tasks');
  }

  const data = await response.json();
  return data.items || [];
};

/**
 * Create a new TaskList in Google Tasks
 */
export const createTaskList = async (title: string, token?: string): Promise<GoogleTaskList> => {
  const activeToken = token || cachedTasksAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Tasks.');
  }

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al crear la lista de tareas');
  }

  return await response.json();
};

/**
 * Fetch tasks in a specific TaskList
 */
export const listTasks = async (tasklistId: string = '@default', token?: string): Promise<GoogleTask[]> => {
  const activeToken = token || cachedTasksAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Tasks.');
  }

  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks?showCompleted=true&showHidden=true`,
    {
      headers: {
        Authorization: `Bearer ${activeToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al obtener las tareas de Google Tasks');
  }

  const data = await response.json();
  return data.items || [];
};

/**
 * Create a new Task in Google Tasks
 */
export const createTask = async (
  tasklistId: string = '@default',
  taskData: { title: string; notes?: string; due?: string },
  token?: string
): Promise<GoogleTask> => {
  const activeToken = token || cachedTasksAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Tasks.');
  }

  const bodyPayload: any = {
    title: taskData.title,
    notes: taskData.notes || 'Agregado desde Waack On Academy'
  };

  if (taskData.due) {
    bodyPayload.due = new Date(taskData.due).toISOString();
  }

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al crear la tarea en Google Tasks');
  }

  return await response.json();
};

/**
 * Toggle task completion status
 */
export const toggleTaskStatus = async (
  tasklistId: string = '@default',
  taskId: string,
  isCompleted: boolean,
  token?: string
): Promise<GoogleTask> => {
  const activeToken = token || cachedTasksAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Tasks.');
  }

  const payload: any = {
    status: isCompleted ? 'completed' : 'needsAction'
  };

  if (isCompleted) {
    payload.completed = new Date().toISOString();
  } else {
    payload.completed = null;
  }

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al actualizar la tarea en Google Tasks');
  }

  return await response.json();
};

/**
 * Delete a task
 */
export const deleteTask = async (
  tasklistId: string = '@default',
  taskId: string,
  token?: string
): Promise<void> => {
  const activeToken = token || cachedTasksAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Tasks.');
  }

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${activeToken}`
    }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al eliminar la tarea de Google Tasks');
  }
};
