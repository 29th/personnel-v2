  $(function(){
    $('.datetime-input').datetime({
		userLang	: 'en',
		americanMode: false,
	});
    
	$('.datetime-input-clear').button();
	
	$('.datetime-input-clear').click(function(){
		$(this).parent().find('.datetime-input').val("");
		return false;
	});	

  });