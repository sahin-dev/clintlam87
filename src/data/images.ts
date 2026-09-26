/**
 * Single source of truth for every photographic asset in the product.
 * Keeping them here means an image is never referenced from more than one place
 * and a broken URL can be fixed once.
 */
export const IMAGES = {
  projectResidence: "/944064f4-130e-4565-8ac5-7da34704dd81.jpg",
  projectVillas: "/448d18bb-97d1-4e5b-8b89-b38bb51ae09f.jpg",
  projectApartments: "/732db7ce-d65e-4e47-b46b-c3ae7716dea7.jpg",
  projectCommercial: "/98ce8480-b566-4c3d-9849-4d91fb85141f.jpg",
  blueprint: "/0f01906f-9880-4950-82ce-594c0322ec53.jpg",
  aiAnalysis: "/39f499a1-bd11-4864-9597-1b2bdfafb12a.jpg",
  lumberYard: "/a0a9c55a-1d9c-4201-b7b7-171babcb6b65.jpg",
  deliveryTruck: "/03f7e23f-2fdd-45bb-9522-4b89bd15dbc1.jpg",
  jobsite: "/bbf22cd4-cc8c-4615-a299-1892bcb972a5.jpg",
  materialsStaged: "/a7b3663a-474c-46a4-8298-691b40530628.jpg",
  platformOps: "/92a9ea2a-a5a1-4d27-bdb1-c8873b3e5714.jpg",
  driverApp: "/40f1e2ab-f49a-4537-962e-614bbddc16f2.jpg",
  driverHomeBanner: "/be9cd42a-cc07-4cf7-9e76-394c59847b2f.jpg",

  driverPortrait: "/86ca0449-ed7c-4298-a2ac-2dbdb145e4da.jpg",

  driverTruckSide: "/4439e148-3f0d-46be-a7d6-44f85f029b24.jpg"

} as const;