# 🩺 Sistema Clínico - Ejes Terapéuticos

Sistema web de gestión clínica integral diseñado para el registro, control y seguimiento de historias clínicas, funciones vitales, triaje, tratamientos de medicina regenerativa, recetas médicas e impresiones optimizadas en formato PDF/A4.

🚀 **Demo en vivo:** [sistema-clinico-pink.vercel.app](https://sistema-clinico-pink.vercel.app/)

---

## 🌟 Características Principales

- **📋 Gestión de Historias Clínicas:** Registro dinámico de antecedentes (APP/APF), examen físico, motivo de consulta y evolución del paciente.
- **🩺 Triaje y Funciones Vitales:** Captura de PA, FC, FR, SatO2, Peso, Talla, IMC, Temperatura y Escala Visual Análoga del Dolor (EVA).
- **🔬 Diagnóstico y Procedimientos:** Codificación de diagnósticos (CIE-10) y asignación detallada de tratamientos (Ozonoterapia, Plasma Rico en Plaquetas, etc.) especificando la zona anatómica exacta (Columna Cervical/Lumbar, Rodilla Derecha/Izquierda, Hombro, etc.).
- **💊 Receta Médica e Indicaciones:** Generación de prescripciones con dosificación, frecuencia, días de tratamiento y recomendaciones/restricciones físicas y ortopédicas.
- **🖨️ Módulo de Impresión Optimizado (`/print`):** Renderizado en diseño compacto A4 de 1 a 2 páginas con colores de fondo forzados (`print-color-adjust`), eliminación automática de saltos de página huérfanos y adaptación según los campos completados.
- **🖼️ Gestión de Exámenes e Imágenes Adjuntas:** Carga y previsualización de radiografías, ecografías y resultados de laboratorio.

---

## 🛠️ Stack Tecnológico

- **Frontend / Framework:** [Next.js](https://nextjs.org/) (React)
- **Estilos / UI:** [Tailwind CSS](https://tailwindcss.com/)
- **Despliegue:** [Vercel](https://vercel.com/)
- **Control de Versiones:** Git & GitHub

---

## 🚀 Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto de manera local en tu entorno de desarrollo:

1. Clonar el repositorio:
   git clone https://github.com/chagipe/sistema-clinico.git

2. Entrar a la carpeta:
   cd sistema-clinico

3. Instalar dependencias:
   npm install

4. Ejecutar el servidor de desarrollo:
   npm run dev

Abre http://localhost:3000 en tu navegador para ver la aplicación en funcionamiento.

---

## 🖨️ Configuración de Impresión

El sistema cuenta con reglas CSS avanzadas dentro de @media print para garantizar que la ficha clínica mantenga el formato institucional al presionar Ctrl + P o ejecutar window.print():

- Configuración de página: @page { size: A4 portrait; margin: 8mm 10mm; }
- Ajuste exacto de colores de fondo (-webkit-print-color-adjust: exact).
- Colapso dinámico de bloques vacíos y optimización de imágenes para evitar hojas sobrantes.

---

## ✒️ Autor

Desarrollado por **Sebastian Begazo**  
- **GitHub:** [@chagipe](https://github.com/chagipe)
