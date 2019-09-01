$(function() {
	startAgain();

	let rawData =  JSON.parse(localStorage.getItem('rawData'));
	console.log('rawData', rawData)

	if (rawData) {
		console.log('data is ready');
		$('tbody').empty();

/***********
Render data from localStorage 
***********/
		rawData.forEach( function(element, index) {
			$('tbody').append(`
				<tr id="heading${index + 1}" class="main">
			      <th scope="row">${index + 1}</th>
			      <td contenteditable>${element['company']}</td>
			      <td contenteditable>${element['skills'].join(', ')}</td>
			      <td class = "action">
			      	<a class="trigger" data-toggle="collapse" data-target="#collapse${index + 1}" aria-expanded="true" aria-controls="collapse${index + 1}" href="javascript:void(0)">Note</a> | 
			      	<a class="delete" href="javascript:void(0)">Delete</a>
			      </td>
			    </tr>
			    <tr id="collapse${index + 1}" class="collapse" aria-labelledby="heading${index + 1}" data-parent="#myAccord">
					<td contenteditable colspan="100%" placeholder="Write description here...">${element['desc']}</td>
				</tr>			    
			`);
		});
		gainFocusToDescEvent();
		bindDeleteEvent();
		hideWhenBlurDesc()

	}
	else $('#chart').html(`<img class="img-fluid" src="images/nodata.png" alt="nodata">`);



	$('#chart-tab').on('click', function() {
		rawData = JSON.parse(localStorage.getItem('rawData'));
		console.log('data to chart', rawData)

		if (rawData) {
			console.log('ready to process data')		
/***********
Process data to draw chart
***********/
			

			const totalSkills = [];
			rawData.forEach( function(element, index) {
				let skillsOfEach = [];

				element.skills.forEach(function(element, index) {
						if (element.trim() && $.inArray(element.trim().toUpperCase(), skillsOfEach) === -1) skillsOfEach.push(element.trim().toUpperCase());

				});

				console.log(skillsOfEach)
				if (skillsOfEach[0]) totalSkills.push(...skillsOfEach);
			});

			const finalData = {};

			const length = totalSkills.length;
			for (let i = 0; i < length; i++) {
				eval(`count${i} = 0`);

				for (let j = 0; j < length; j++) {
					if (totalSkills[j] === totalSkills[i]) eval(`count${i}++`);
				}

				finalData[totalSkills[i]] = eval(`count${i}`);
			}

			console.log('finalData', finalData)

			if (!jQuery.isEmptyObject(finalData)) {
				console.log('ready to draw chart')
				$('#chart').empty();

/***********
Draw chart
***********/
				setTimeout(function() {
					$('#chart').html(`<canvas id="myChart" width="400" height="200"></canvas>`);
				
					const ctx = $('#myChart')[0].getContext('2d');
					const myChart = new Chart(ctx, {
						type: 'bar',
						data: {
							labels: Object.keys(finalData),
							datasets: [{
								label: '# of requirement',
								data: Object.values(finalData),
								backgroundColor: [
								'rgba(255, 99, 132, 0.2)',
								'rgba(54, 162, 235, 0.2)',
								'rgba(255, 206, 86, 0.2)',
								'rgba(75, 192, 192, 0.2)',
								'rgba(153, 102, 255, 0.2)',
								'rgba(255, 159, 64, 0.2)'
								],
								borderColor: [
								'rgba(255, 99, 132, 1)',
								'rgba(54, 162, 235, 1)',
								'rgba(255, 206, 86, 1)',
								'rgba(75, 192, 192, 1)',
								'rgba(153, 102, 255, 1)',
								'rgba(255, 159, 64, 1)'
								],
								borderWidth: 1
							}]
						},
						options: {
							scales: {
								yAxes: [{
									ticks: {
										beginAtZero: true
									}
								}]
							}
						}
					});
				}, 200);			
			} else $('#chart').html(`<img class="img-fluid" src="images/nodata.png" alt="nodata">`);
		} else $('#chart').html(`<img class="img-fluid" src="images/nodata.png" alt="nodata">`);
	});


	

/***********
Add new row
***********/
	$('#add-new').on('click', function() {
		let $lastRow = $(this).parent().parent().siblings('.table-responsive').find('tbody tr.main:last');
		let order = $lastRow.find('th').text();

		$('tbody').append(`
			<tr id="heading${Number(order) + 1}" class="main">
		      <th scope="row">${Number(order) + 1}</th>
		      <td contenteditable></td>
		      <td contenteditable></td>
		      <td class = "action">
		      	<a class="trigger" data-toggle="collapse" data-target="#collapse${Number(order) + 1}" aria-expanded="true" aria-controls="collapse${Number(order) + 1}" href="javascript:void(0)">Note</a> | 
		      	<a class="delete" href="javascript:void(0)">Delete</a>
		      </td>
		    </tr>
		    <tr id="collapse${Number(order) + 1}" class="collapse" aria-labelledby="heading${Number(order) + 1}" data-parent="#myAccord">
				<td contenteditable colspan="100%" placeholder="Write description here..."></td>
			</tr>	
		`);
		gainFocusToDescEvent();
		bindDeleteEvent();
		hideWhenBlurDesc()

		// Đóng accordion đang mở (nếu có)
		$(this).parent().parent().siblings('.table-responsive').find('tbody tr.show').removeClass('show');
		
		// Gain focus vào Company của row mới
		let $newLastRow = $(this).parent().parent().siblings('.table-responsive').find('tbody tr.main').last();
		$newLastRow.find('td:first').focus();
	});	

/***********
Click "Save" btn to update localStorage
***********/
	$('#save-btn').on('click', function() {
		// update data in localStorage
		setLocalStorage(updateRawData());

		// save last-edited-on date to localStorage
		localStorage.setItem('date', $('.timestamp').text());

		// show noti
		$('#toast-wrap').show();
		$('.toast').toast('show');
	});

/***********
Last edit on...
***********/ 
	if (localStorage.getItem('date')) {
		$('.timestamp').text(localStorage.getItem('date'));
	}

/***********
Minors...
***********/ 

	// Delete All
	$('.delete-all').on('click', function() {
		if (confirm("Are you sure you want to delete all rows?")) {
			localStorage.setItem('rawData', null);
			startAgain();
		}
	});

/***********
functions
***********/ 

	function startAgain() {
		$('tbody').empty();
		$('tbody').append(`
			<tr id="heading1" class="main">
		      <th scope="row">1</th>
		      <td contenteditable id="editable"></td>
		      <td contenteditable></td>
		      <td class = "action">
		      	<a class="trigger" data-toggle="collapse" data-target="#collapse1" aria-expanded="true" aria-controls="collapse1" href="javascript:void(0)">Note</a> | 
		      	<a class="delete" href="javascript:void(0)">Delete</a>
		      </td>
		    </tr>
		    <tr id="collapse1" class="collapse" aria-labelledby="heading1" data-parent="#myAccord">
				<td contenteditable colspan="100%" placeholder="Write description here..."></td>
			</tr>			
		`);
		gainFocusToDescEvent();
		bindDeleteEvent();
		hideWhenBlurDesc();
		$('#editable').focus();
	}
	
	// Save input data to localStorage
	function updateRawData() {
		const companies = [];
		$('tbody').find('tr.main').each(function(index, el) {
			let companyName = $(el).find('td:first').text();
			let skills = $(el).find('td:eq(1)').text().trim();
			let companyDesc = $(el).next().children().text();
			
			if (companyName || skills || companyDesc) companies.push({
				company: companyName,
				skills: skills.split(','),
				desc: companyDesc
			});
		});
		if (companies.length > 0) return companies;
		else return null;
	}
	// Save input data to localStorage
	function setLocalStorage(rawData) {
		console.log('data to save to localStorage', rawData)
		if(rawData) {console.log('localStorage updated'); localStorage.setItem('rawData', JSON.stringify(rawData));}
		else localStorage.setItem('rawData', null);
	}

	function bindDeleteEvent() {
		$('.delete').on('click', function() {
			if (confirm("Are you sure you want to delete this row?")) {
				let thisTr = $(this).parents('.main');
				thisTr.next().remove();
				thisTr.remove();
			}
		});
	}

	function gainFocusToDescEvent() {
		$('.trigger').on('click', function() {
			let $desc = $(this).parent().parent().next().children();
			
			setTimeout(function() {
				if (!$desc.text()) $desc.focus();
			}, 1);
		});
	}

	function hideWhenBlurDesc() {
		$('td[placeholder]').on('blur', function() {
			$(this).parent().removeClass('show');
		});
	}

/***********
Set max-height for table
***********/ 
	let h_ul = $('.nav').height();
	let h_belowTable = $('#below-table').height();
	let h_timestamp = $('.timestamp-wrap').height();
	let h_rest = h_ul + h_belowTable + h_timestamp;

	$('.table-responsive').css('max-height', `calc(100vh - ${h_rest}px - 45px)`);
});

