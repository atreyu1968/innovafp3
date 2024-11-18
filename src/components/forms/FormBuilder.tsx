import React, { useState } from 'react';
import { Save, Send, Plus, Download, Upload } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Form, FormField as IFormField } from '../../types/form';
import FormField from './FormField';
import TextareaAutosize from 'react-textarea-autosize';
import WordImport from './WordImport';
import { useNotifications } from '../notifications/NotificationProvider';

interface FormBuilderProps {
  initialData?: Form;
  onSubmit: (data: Partial<Form>) => void;
  onCancel: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Form>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    fields: initialData?.fields || [],
    assignedRoles: initialData?.assignedRoles || [],
    startDate: initialData?.startDate,
    endDate: initialData?.endDate,
    status: initialData?.status || 'borrador',
    allowMultipleResponses: initialData?.allowMultipleResponses ?? false,
  });

  const [showWordImport, setShowWordImport] = useState(false);
  const { showNotification } = useNotifications();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = (afterId?: string) => {
    const newField: IFormField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: '',
      required: false,
    };

    if (afterId) {
      const index = formData.fields?.findIndex(f => f.id === afterId) ?? -1;
      if (index !== -1) {
        const newFields = [...(formData.fields || [])];
        newFields.splice(index + 1, 0, newField);
        setFormData({ ...formData, fields: newFields });
        return;
      }
    }

    setFormData({
      ...formData,
      fields: [...(formData.fields || []), newField],
    });
  };

  const updateField = (id: string, updates: Partial<IFormField>) => {
    setFormData({
      ...formData,
      fields: formData.fields?.map(field =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const duplicateField = (id: string) => {
    const field = formData.fields?.find(f => f.id === id);
    if (field) {
      const newField = {
        ...field,
        id: crypto.randomUUID(),
        label: `${field.label} (copia)`,
      };
      const index = formData.fields?.findIndex(f => f.id === id) ?? -1;
      if (index !== -1) {
        const newFields = [...(formData.fields || [])];
        newFields.splice(index + 1, 0, newField);
        setFormData({ ...formData, fields: newFields });
      }
    }
  };

  const removeField = (id: string) => {
    setFormData({
      ...formData,
      fields: formData.fields?.filter(field => field.id !== id),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((formData) => {
        const oldIndex = formData.fields?.findIndex((field) => field.id === active.id);
        const newIndex = formData.fields?.findIndex((field) => field.id === over.id);

        return {
          ...formData,
          fields: arrayMove(formData.fields || [], oldIndex!, newIndex!),
        };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent, publish = false) => {
    e.preventDefault();

    if (!formData.title) {
      showNotification('error', 'El formulario debe tener un título');
      return;
    }

    if (!formData.assignedRoles?.length) {
      showNotification('error', 'Debes asignar al menos un rol');
      return;
    }

    onSubmit({
      ...formData,
      status: publish ? 'publicado' : 'borrador',
    });
  };

  const handleImportFields = (fields: IFormField[]) => {
    setFormData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), ...fields]
    }));
    setShowWordImport(false);
    showNotification('success', 'Campos importados correctamente');
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <TextareaAutosize
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título del formulario..."
            className="w-full resize-none text-2xl font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
            required
          />

          <TextareaAutosize
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del formulario..."
            className="w-full resize-none text-gray-500 bg-transparent border-none focus:ring-0 p-0"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowWordImport(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Word
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Inicio
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Fin
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Roles Asignados
        </label>
        <div className="mt-2 space-y-2">
          {['gestor', 'coordinador_subred', 'coordinador_general'].map((role) => (
            <label key={role} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={(formData.assignedRoles || []).includes(role as any)}
                onChange={(e) => {
                  const roles = new Set(formData.assignedRoles || []);
                  if (e.target.checked) {
                    roles.add(role as any);
                  } else {
                    roles.delete(role as any);
                  }
                  setFormData({
                    ...formData,
                    assignedRoles: Array.from(roles),
                  });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {role === 'gestor'
                  ? 'Gestor'
                  : role === 'coordinador_subred'
                  ? 'Coordinador de Subred'
                  : 'Coordinador General'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Respuestas por usuario
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Define si un usuario puede enviar múltiples respuestas
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.allowMultipleResponses}
              onChange={(e) => setFormData({ ...formData, allowMultipleResponses: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">
              Permitir múltiples respuestas
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Campos del Formulario
          </h3>
          <button
            type="button"
            onClick={() => addField()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Campo
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={formData.fields?.map(field => field.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {formData.fields?.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  availableFields={formData.fields || []}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onDelete={() => removeField(field.id)}
                  onDuplicate={() => duplicateField(field.id)}
                  onAddField={() => addField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Borrador
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Publicar
        </button>
      </div>

      {showWordImport && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <WordImport
            onImport={handleImportFields}
            onClose={() => setShowWordImport(false)}
          />
        </div>
      )}
    </form>
  );
};

export default FormBuilder;