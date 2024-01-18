module.exports = {
	seleccionarSkills: (seleccionada = [], opciones) => {
		console.log(seleccionada)

		const skills = [
			'Seguridad',
			'Programador',
			'Profesor',
			'atencion al cliente',
			'promotores',
			'ingeniero sofware',
			'ingeniero civil',
			'ingeniero electricista',
			'ingeniero mecanico',
			'ingeniero electronico',
			'ingeniero quimico',
		];

		let html = '';
		skills.forEach((skill) => {
			html += `
                <li ${seleccionada.includes(skill) ? 'class="activo"' :''}>${skill}</li>
            `;
		});
		return (opciones.fn().html = html);
	},

	tipoContrato: (seleccionado, opciones)=> {
	 	return opciones.fn(this).replace(
			new RegExp(`value="${seleccionado}"`), '$& selected="selected"'
			
		)
	},

	mostrarAlertas: (errores = {}, alertas) =>{
		const categoria = Object.keys(errores);

		//console.log(errores[categoria]);
		//console.log(categorias);

		let html = '';
		if(categoria.length){
			 errores[categoria].forEach(error => {
				html += `
				<div class="${categoria} alerta">
					${error}
				</div>
				`;

			 })
		}
		// console.log(html);
		 return alertas.fn().html = html;
	}



	
};

