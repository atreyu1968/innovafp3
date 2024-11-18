import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subnet, EducationalCenter, Island, ProfessionalFamily, CenterType } from '../types/network';

export const ISLANDS: Island[] = [
  'Tenerife',
  'Gran Canaria',
  'Lanzarote',
  'La Palma',
  'La Gomera',
  'El Hierro',
  'Fuerteventura'
];

interface NetworkState {
  subnets: Subnet[];
  centers: EducationalCenter[];
  families: ProfessionalFamily[];
  centerTypes: CenterType[];
  addSubnet: (subnet: Subnet) => void;
  updateSubnet: (subnet: Subnet) => void;
  deleteSubnet: (subnetId: string) => void;
  addCenter: (center: EducationalCenter) => void;
  updateCenter: (center: EducationalCenter) => void;
  deleteCenter: (centerId: string) => void;
  addFamily: (family: ProfessionalFamily) => void;
  updateFamily: (family: ProfessionalFamily) => void;
  deleteFamily: (familyId: string) => void;
  addCenterType: (type: CenterType) => void;
  updateCenterType: (type: CenterType) => void;
  deleteCenterType: (typeId: string) => void;
  getCIFPs: () => EducationalCenter[];
  getSubnetsByIsland: (island: Island) => Subnet[];
  getCentersBySubnet: (subnetId: string) => EducationalCenter[];
  getFamiliesByYear: (yearId: string) => ProfessionalFamily[];
  getCenterTypesByYear: (yearId: string) => CenterType[];
  getCenterType: (typeId: string) => CenterType | undefined;
  importSubnetsFromCSV: (file: File) => Promise<{ success: boolean; message: string }>;
  importCentersFromCSV: (file: File) => Promise<{ success: boolean; message: string }>;
  importFamiliesFromCSV: (file: File) => Promise<{ success: boolean; message: string }>;
  importCenterTypesFromCSV: (file: File) => Promise<{ success: boolean; message: string }>;
  importSubnetsFromYear: (fromYearId: string, toYearId: string) => void;
  importCentersFromYear: (fromYearId: string, toYearId: string) => void;
  importFamiliesFromYear: (fromYearId: string, toYearId: string) => void;
  importCenterTypesFromYear: (fromYearId: string, toYearId: string) => void;
  removeDuplicates: () => { subnets: number; centers: number; families: number; centerTypes: number };
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      subnets: [],
      centers: [],
      families: [],
      centerTypes: [
        {
          id: '1',
          code: 'CIFP',
          name: 'Centro Integrado de Formación Profesional',
          academicYearId: '1',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          code: 'IES',
          name: 'Instituto de Educación Secundaria',
          academicYearId: '1',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],

      // Previous methods remain the same...

      addCenterType: (type) => set((state) => ({
        centerTypes: [...state.centerTypes, type]
      })),

      updateCenterType: (updatedType) => set((state) => ({
        centerTypes: state.centerTypes.map(type =>
          type.id === updatedType.id ? updatedType : type
        )
      })),

      deleteCenterType: (typeId) => set((state) => ({
        centerTypes: state.centerTypes.filter(type => type.id !== typeId)
      })),

      getCenterTypesByYear: (yearId) => {
        const { centerTypes } = get();
        return centerTypes.filter(type => type.academicYearId === yearId);
      },

      getCenterType: (typeId) => {
        const { centerTypes } = get();
        return centerTypes.find(type => type.id === typeId);
      },

      importCenterTypesFromCSV: async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              const rows = text.split('\n').filter(Boolean);
              const types: CenterType[] = rows.slice(1).map((row) => {
                const [code, name] = row.split(',').map(cell => cell.trim());
                return {
                  id: crypto.randomUUID(),
                  code,
                  name,
                  academicYearId: '', // Set when importing
                  active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
              });

              set((state) => ({
                centerTypes: [...state.centerTypes, ...types],
              }));

              resolve({
                success: true,
                message: `${types.length} tipos de centro importados correctamente`,
              });
            } catch (error) {
              resolve({
                success: false,
                message: 'Error al procesar el archivo CSV',
              });
            }
          };
          reader.readAsText(file);
        });
      },

      importCenterTypesFromYear: (fromYearId, toYearId) => {
        const { centerTypes } = get();
        const typesToImport = centerTypes
          .filter((type) => type.academicYearId === fromYearId)
          .map((type) => ({
            ...type,
            id: crypto.randomUUID(),
            academicYearId: toYearId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

        set((state) => ({
          centerTypes: [...state.centerTypes, ...typesToImport],
        }));
      },

      removeDuplicates: () => {
        const state = get();
        const uniqueTypes = new Map<string, CenterType>();

        // Remove duplicate center types by code
        state.centerTypes.forEach(type => {
          if (!uniqueTypes.has(type.code) || type.updatedAt > uniqueTypes.get(type.code)!.updatedAt) {
            uniqueTypes.set(type.code, type);
          }
        });

        const removedCount = {
          subnets: state.subnets.length - uniqueTypes.size,
          centers: state.centers.length - uniqueTypes.size,
          families: state.families.length - uniqueTypes.size,
          centerTypes: state.centerTypes.length - uniqueTypes.size
        };

        set({
          centerTypes: Array.from(uniqueTypes.values())
        });

        return removedCount;
      }
    }),
    {
      name: 'network-storage',
    }
  )
);