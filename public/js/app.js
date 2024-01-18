import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
	const skills = document.querySelector('.lista-conocimientos');

	//limpiar alertas
	let alertas = document.querySelector('.alertas');

	if(alertas){
		limpiarAlertas(alertas);
	}

	if (skills) {
		skills.addEventListener('click', agregarSkills);

		//al estar en editar se llama esta funcion
		skillsSeleccionado()
	}

	const vacantesListado = document.querySelector('.panel-administracion')

	if(vacantesListado){
		vacantesListado.addEventListener('click',accionesListado)
	}


});
const skills = new Set();
const agregarSkills = (e) => {
	//console.log(e.target);
	if (e.target.tagName === 'LI') {
		//skills.add(e.target.textContent);
		if (e.target.classList.contains('activo')) {
			// quitar el activo
			skills.delete(e.target.textContent);
			e.target.classList.remove('activo');
		} else {
			// colocar nuevamente el activo
			skills.add(e.target.textContent);
			e.target.classList.add('activo');
		}
	}
	// console.log(skills);
	const skillsArray = [...skills];
	document.querySelector('#skills').value = skillsArray;
};

const skillsSeleccionado = ()=>{
	const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

	seleccionadas.forEach(seleccionadas =>{
		skills.add(seleccionadas.textContent)
	})

	const skillsArray = [...skills];
	document.querySelector('#skills').value = skillsArray;

}

const limpiarAlertas = ()=>{
	const alert = document.querySelector('.alertas')

	const intervalo = setInterval(()=>{
		if(alert.children.length > 0 ){
		alert.removeChild(alert.children[0]);
	}else if(alert.children.length === 0){
		alert.parentElement.removeChild(alert);
		clearInterval(intervalo)
	}
	},3000)
}

const accionesListado = e => {
 
    e.preventDefault();
 
    if(e.target.dataset.eliminar){
        // eliminar por axios
        Swal.fire({
            title: '¿Confirmar Eliminación?',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',//el nombre del parámetro cambio de ser type a icon
             showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText : 'No, Cancelar'
        }).then((result) => {
            if (result.value) {
                // enviar la petición con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                
                // Axios para eliminar el registro
                axios.delete(url, { params: {url} })
                    .then(function(respuesta) {
                        
                        if(respuesta.status === 200) {
                            Swal.fire(
                                'Eliminado',
                                respuesta.data,
                                'success'

                            );
 
                            //Eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            icon:'error',
                            title: 'Hubo un error',
                            text: 'No Se pudo eliminar'
                        })
                    })
 
            }
 
        })
 
    }  else if(e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
}