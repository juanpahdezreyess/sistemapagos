// Clase para gestionar alumnos
class SistemaEscolar {
    constructor() {
        this.alumnos = this.cargarAlumnos();
    }

    // Cargar alumnos desde LocalStorage
    cargarAlumnos() {
        const alumnosGuardados = localStorage.getItem('alumnosEscuela');
        return alumnosGuardados ? JSON.parse(alumnosGuardados) : [];
    }

    // Guardar alumnos en LocalStorage
    guardarAlumnos() {
        localStorage.setItem('alumnosEscuela', JSON.stringify(this.alumnos));
    }

    // Registrar nuevo alumno
    registrarAlumno(nombre, grado, grupo, mensualidad, beca = 0) {
        const nuevoAlumno = {
            id: Date.now().toString(),
            nombre,
            grado,
            grupo,
            mensualidad: parseFloat(mensualidad),
            beca: parseFloat(beca),
            pagos: [],
            adeudo: mensualidad * (1 - beca/100) * 10 // Adeudo anual estimado
        };
        
        this.alumnos.push(nuevoAlumno);
        this.guardarAlumnos();
        return nuevoAlumno;
    }

    // Registrar pago para un alumno
    registrarPago(idAlumno, monto, concepto) {
        const alumno = this.alumnos.find(a => a.id === idAlumno);
        if (!alumno) return false;

        const nuevoPago = {
            fecha: new Date().toISOString(),
            monto: parseFloat(monto),
            concepto
        };

        alumno.pagos.push(nuevoPago);
        alumno.adeudo -= nuevoPago.monto;
        this.guardarAlumnos();
        return true;
    }

    // Obtener alumno por ID
    obtenerAlumno(id) {
        return this.alumnos.find(a => a.id === id);
    }

    // Generar lista HTML de alumnos
    generarListaAlumnos() {
        if (this.alumnos.length === 0) {
            return '<p>No hay alumnos registrados aún.</p>';
        }

        let html = '<table><thead><tr>';
        html += '<th>Nombre</th><th>Grado</th><th>Grupo</th>';
        html += '<th>Mensualidad</th><th>Beca</th><th>Adeudo</th><th>Acciones</th>';
        html += '</tr></thead><tbody>';

        this.alumnos.forEach(alumno => {
            html += `<tr>
                <td>${alumno.nombre}</td>
                <td>${alumno.grado}</td>
                <td>${alumno.grupo}</td>
                <td>$${alumno.mensualidad.toFixed(2)}</td>
                <td>${alumno.beca}%</td>
                <td>$${alumno.adeudo.toFixed(2)}</td>
                <td>
                    <button onclick="mostrarPago('${alumno.id}')">Pagar</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    }

    // Generar formulario de pago
    generarFormularioPago(idAlumno) {
        const alumno = this.obtenerAlumno(idAlumno);
        if (!alumno) return '<p>Alumno no encontrado</p>';

        let html = `<h3>Registrar pago para ${alumno.nombre}</h3>`;
        html += `<p>Grado: ${alumno.grado} ${alumno.grupo} | Adeudo actual: $${alumno.adeudo.toFixed(2)}</p>`;
        
        html += `<form id="formulario-pago" onsubmit="procesarPago(event, '${alumno.id}')">
            <div class="campo">
                <label for="monto-pago">Monto:</label>
                <input type="number" id="monto-pago" step="0.01" min="0.01" required>
            </div>
            <div class="campo">
                <label for="concepto-pago">Concepto:</label>
                <select id="concepto-pago" required>
                    <option value="">Seleccione...</option>
                    <option value="Mensualidad">Mensualidad</option>
                    <option value="Inscripción">Inscripción</option>
                    <option value="Materiales">Materiales</option>
                    <option value="Uniforme">Uniforme</option>
                </select>
            </div>
            <button type="submit">Registrar Pago</button>
        </form>`;

        return html;
    }
}

// Instancia global del sistema
const sistema = new SistemaEscolar();

// Funciones para manejar la interfaz
function mostrarSeccion(idSeccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('main section').forEach(sec => {
        sec.classList.remove('seccion-activa');
        sec.classList.add('seccion-oculta');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(idSeccion).classList.remove('seccion-oculta');
    document.getElementById(idSeccion).classList.add('seccion-activa');
    
    // Actualizar la lista si es necesario
    if (idSeccion === 'lista') {
        document.getElementById('contenedor-alumnos').innerHTML = sistema.generarListaAlumnos();
    }
}

function mostrarPago(idAlumno) {
    mostrarSeccion('pagos');
    document.getElementById('contenedor-pagos').innerHTML = sistema.generarFormularioPago(idAlumno);
}

function procesarPago(event, idAlumno) {
    event.preventDefault();
    
    const monto = document.getElementById('monto-pago').value;
    const concepto = document.getElementById('concepto-pago').value;
    
    if (sistema.registrarPago(idAlumno, monto, concepto)) {
        alert('Pago registrado exitosamente!');
        mostrarSeccion('lista');
    } else {
        alert('Error al registrar el pago');
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el formulario de registro
    document.getElementById('formulario-alumno').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const grado = document.getElementById('grado').value;
        const grupo = document.getElementById('grupo').value;
        const mensualidad = document.getElementById('mensualidad').value;
        const beca = document.getElementById('beca').value || 0;
        
        sistema.registrarAlumno(nombre, grado, grupo, mensualidad, beca);
        
        alert('Alumno registrado exitosamente!');
        this.reset();
        
        // Actualizar la lista si está visible
        if (document.getElementById('lista').classList.contains('seccion-activa')) {
            document.getElementById('contenedor-alumnos').innerHTML = sistema.generarListaAlumnos();
        }
    });
    
    // Mostrar la sección de registro por defecto
    mostrarSeccion('registro');
});
