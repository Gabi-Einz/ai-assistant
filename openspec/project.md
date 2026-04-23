Objetivo
La idea de esta prueba es evaluar cómo resolvés una tarea fullstack real, combinando backend y frontend en partes iguales.
Buscamos una solución funcional, bien estructurada, segura y mantenible, con buenas decisiones técnicas y criterio de implementación.
El ejercicio está pensado sobre el mismo stack que usamos internamente, y con una complejidad bastante cercana a tareas reales de nuestro día a día.
Algunas decisiones quedan abiertas para que puedas resolverlas con tu criterio. Nos interesa ver cómo pensás la arquitectura, cómo organizas el código y qué decisiones tomás al implementar.
Importante: Podés usar IA de forma parcial o total para resolver la prueba.
Si lo hacés, te pedimos que lo documentes en el README.md: workflow aplicado, prompts utilizados y modelo/s usado/s.
El uso de IA no afecta la evaluación; nos interesa entender cómo la integras en tu proceso de trabajo.

Descripción
Debes implementar dos pantallas:
/auth


/chat




Autenticación
Implementar registro y autenticación utilizando Better Auth.
Requisitos
Formularios administrados con TanStack Form


Validaciones con Zod



Chat
Construir una UI de chat con comportamiento similar al de un asistente de IA.
Requisitos
Listado de chats recientes con scroll infinito + buscador por título 


Permitir:


eliminar chats


anclar chats


renombrar chats


El _id del chat actual y el término de búsqueda de chats deben persistirse en la URL


Chats, mensajes y metadatos deben persistirse en base de datos


La estructura debe contemplar escalabilidad para múltiples conversaciones por usuario y futuras extensiones del historial.


IA
El agente debe responder utilizando herramientas reales.
Requisitos
Poder indicar:


fecha actual


hora actual


clima actual


Esta información debe renderizarse con una UI específica (no como mensaje de texto dentro del chat)


Mostrar en la UI qué herramienta fue utilizada


Los mensajes deben administrarse vía streaming


La implementación debe permitir extender nuevas tools de forma simple


Las tools deben devolver payloads tipados, y la UI debe renderizar esos resultados mediante componentes específicos desacoplados del mensaje textual.

Requisitos técnicos
Stack base
TypeScript
AI SDK https://ai-sdk.dev/
Zod http://zod.dev/
BetterAuth https://better-auth.com/
tRPC https://trpc.io/
pnpm https://pnpm.io/
turborepo https://turborepo.dev/

Frontend
HeroUI https://heroui.com/
TanStack Router,
TanStack Form,
TanStack Query https://tanstack.com/

Backend
Bun https://bun.com/
Hono https://hono.dev/
MongoDB Driver Nativo https://www.mongodb.com/es/docs/languages/javascript/




Criterios de evaluación
Tipado fuerte en todo el proyecto


No utilizar any ni casts innecesarios


Validaciones robustas con Zod


Consultas eficientes a base de datos


Código ordenado y fácil de leer


UI simple, consistente y funcional


Manejo correcto de estados: loading, error, empty.


Buen criterio de arquitectura





README esperado
Además de las instrucciones para correr el proyecto, incluí:
breve explicación de la arquitectura elegida


decisiones técnicas principales


workflow aplicado con IA


prompts utilizados


modelos utilizados


qué mejorarías con más tiempo



Entrega
Debés compartir:
Repositorio en GitHub con el código fuente


README.md completo


Link de despliegue funcional en Vercel
