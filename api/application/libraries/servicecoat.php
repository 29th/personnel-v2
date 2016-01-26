<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

define("ALIGN_LEFT", "left");
define("ALIGN_CENTER", "center");
define("ALIGN_RIGHT", "right");
define("VALIGN_TOP", "top");
define("VALIGN_MIDDLE", "middle");
define("VALIGN_BOTTOM", "bottom");

class ServiceCoat {
    private $root = __DIR__;

	//Arrays of codes supported
		private $scAllRanks = array('pvt','pfc','t5','cpl','t4','sgt','t3','ssgt','tsgt','msgt','fsgt','2lt','1lt','cpt','maj','lt col');
		private	$scAllAQBadges = array(
			'm:rifle:dod','m:bar:dod','m:zook:dod','m:mg:dod','m:armor:dod','m:smg:dod','m:sniper:dod','m:mortar:dod',
			's:rifle:dod','s:bar:dod','s:zook:dod','s:mg:dod','s:armor:dod','s:smg:dod','s:sniper:dod','s:mortar:dod',
			'e:rifle:dod','e:bar:dod','e:zook:dod','e:mg:dod','e:armor:dod','e:smg:dod','e:sniper:dod','e:mortar:dod',
			'm:rifle:dh','m:bar:dh','m:zook:dh','m:mg:dh','m:armor:dh','m:smg:dh','m:sniper:dh','m:mortar:dh',
			's:rifle:dh','s:bar:dh','s:zook:dh','s:mg:dh','s:armor:dh','s:smg:dh','s:sniper:dh','s:mortar:dh',
			'e:rifle:dh','e:bar:dh','e:zook:dh','e:mg:dh','e:armor:dh','e:smg:dh','e:sniper:dh','e:mortar:dh',
			'm:rifle:ro2','m:bar:ro2','m:zook:ro2','m:mg:ro2','m:smg:ro2','m:sniper:ro2',
			's:rifle:ro2','s:bar:ro2','s:zook:ro2','s:mg:ro2','s:smg:ro2','s:sniper:ro2',
			'e:rifle:ro2','e:bar:ro2','e:zook:ro2','e:mg:ro2','e:smg:ro2','e:sniper:ro2',
			'm:rifle:a3','m:bar:a3','m:zook:a3','m:mg:a3','m:sniper:a3','m:armor:a3','m:smg:a3',
			's:rifle:a3','s:bar:a3','s:zook:a3','s:mg:a3','s:sniper:a3','s:armor:a3','s:smg:a3',
			'e:rifle:a3','e:bar:a3','e:zook:a3','e:mg:a3','e:sniper:a3','e:armor:a3','e:smg:a3'
			);
		private $scAllARibbons = array('french','ww1v','aocc','eamc','acamp','adef','gcon','aach','arcom','anpdr','pheart','bstar','sm','lom','sstar','dsm','dsc','ww2v','dms','movsm','arcam');
		private $scAllURibbons = array('dh','dod','trenches','battlegrounds','muc','rs','arma');
		private $scAllTRBadges = array('eib','cib','cib1','cib2','cib3','cib4','cab','cab1','cab2','cab3','cab4');
		private $scAllTLBadges = array('rd');
		private $scAllBLBadges = array('drillsergeant');
		private $scAllBRBadges = array('mp','recruiter','recruiter2','recruiter3','recruiter4','recruiter5');
	//SC Positions
		private $scMidMarksPos = array('x' => '545', 'y' => '316');
		private $scMidRibPos = array('x' => '543', 'y' => '306');
    
    /**
     * Enables the use of CI super-global without having to define an extra variable
     */
    public function __get($var) {
        return get_instance()->$var;
    }

    /**
     * Used to be __construct() but we don't want it to do things like create images every time we load the class in CI
     */
	public function prepare()
	{
		global $root;
		//Image Variables
			$this->scImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . '29th_ServiceJacket.png');
			$this->scImageSig = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . '29th_ServiceJacketSig.png');
			$this->scImgSize = array();
			$this->scImgSize['x'] = imagesx($this->scImage);
			$this->scImgSize['y'] = imagesy($this->scImage);
		//Address Variables	$this->scAccess;
			$this->scName = null;
			$this->scID = null;
			$this->scRank = null;	
			$this->scAQBadges = array();	
			$this->scARibbons = array();
			$this->scURibbons = array();
			$this->scTRBadges = array();
			$this->scTLBadges = array();
			$this->scBLBadges = array();
			$this->scBRBadges = array();
			$this->scInsignia = null;	
		//Other Variables
			$this->scFourthInch = 7; //approx size of 1/4 an inch on the jacket
			$this->scIsOfficer = false; //needed for cropping
	}
	
	public function update($member_id) {
	    if(file_exists(getenv('DIR_COAT_RESOURCES'))) {
    	    $this->load->model('member_model');
    	    $this->load->model('awarding_model');
    	    
            $gdDate = $this->find_GD( $member_id );
            $member = nest($this->member_model->get_by_id($member_id));
            $rank = str_replace( '/', '', str_replace('.', '', $member['rank']['abbr']) );
            $unit = '29th';
            //Checking for GD or DD to remove previous awards
            //$awards = array('acamp', 'gcon', 'french', 'lom', 'aocc', 's:rifle:dod', 'e:mg:dod', 'dsc', 'aocc', 'aocc', 'adef', 'dod', 'aocc', 'cib1', 'aocc', 'm:armor:dh', 'aocc', 'ww1v', 'cab1', 'aocc', 'aocc', 'aocc', 'aocc', 'aocc', 'aocc', 'ww1v');
            if( $gdDate )
            	$awardings = $this->awarding_model->where(array('awardings.member_id' => $member_id, 'awardings.date >' => $gdDate ))->get()->result_array();
            else
            	$awardings = $this->awarding_model->where('awardings.member_id', $member_id)->get()->result_array();
            $awardings_abbr = pluck('award|abbr', $awardings);
            $this->update_servicecoatC($member['last_name'], $member['steam_id'], $rank, $unit, $awardings_abbr);
//            $this->update_servicecoatC( $this->find_GD( $member_id ), $member['steam_id'], $rank, $unit, $awardings_abbr);
            
            return array(
                'name' =>  $member['last_name']
                ,'id' => $member['steam_id']
                ,'rank' => $rank
                ,'unit' => $unit
                ,'awardings' => $awardings_abbr
            );
	    }
	}
	
	public function find_GD( $member_id ) {
        $this->load->model('discharge_model');
        $this->discharge_model->where('type !=','Honorable');
        $this->discharge_model->where('discharges.member_id',$member_id);
        $this->discharge_model->order_by('date DESC');
        $gdDate = $this->discharge_model->get()->result_array();
		return ( $gdDate ? $gdDate[0]['date'] : '' );
	}

	private function imageftboxtoImage(&$image, $font, $font_size, $left, $top, $right, $bottom, $align, $valign, $text, $color)
	{
		$text = strtoupper($text); //Sets name to uppercase
		//Get size of box
			$height = $bottom - $top;
			$width = $right - $left;
			$text_info = imageftbbox($font_size, 0, $font, $text);
			$textimage_yheight = abs($text_info[7]);
			$textimage_xwidth = abs($text_info[4]);
		//Get Mids
			$box_ymid = $height / 2;
			$box_xmid = $width / 2;
			$text_ymid = $textimage_yheight / 2;
			$text_xmid = $textimage_xwidth / 2;
		//Vertical Align (only supports top & middle)
			switch($valign){
			   case VALIGN_TOP: //Top
				   $y = $top + $text_ymid;
				   break;
			   case VALIGN_MIDDLE: //Middle
				   $y = $top + $box_ymid + $text_ymid;
				   break;
			   case VALIGN_BOTTOM: //Bottom
				   break;
			   default:
				   return false;
			 }
		//Horizontal Align
			switch($align){
			   case ALIGN_LEFT: // Left
				   break;
			   case ALIGN_CENTER: // Center
				   $x = $left + $box_xmid - $text_xmid;
				   break;
			   case ALIGN_RIGHT: // Right
				   break;
			   default:
				   return false;
			} 
		imagefttext($image, $font_size, 0, $x, $y, $color, $font, $text);	
		return true;
	}

	private function imagetransrotate(&$image, $angle)
	{
		global $root;
		//Init a large image with trans
			$CutterImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'blank500.png');
			$CutterImgSizeX = imagesx($CutterImage);
			$CutterImgSizeY = imagesy($CutterImage);
			$ImageSizeX = imagesx($image);
			$ImageSizeY = imagesy($image);
			$ImageToCutterXScale = ($CutterImgSizeX / $ImageSizeX);
			$ImageToCutterYScale = ($CutterImgSizeY / $ImageSizeY);
			$CutterImgPosX = ($CutterImgSizeX / 2) - ($ImageSizeX / 2);
			$CutterImgPosY = ($CutterImgSizeY / 2) - ($ImageSizeY / 2);
		//Put $image in large image
			imagecopy($CutterImage, $image, $CutterImgPosX, $CutterImgPosY, 0, 0, $ImageSizeX, $ImageSizeY);
		//Rotate & Crop
			$CutterImage = imagerotate($CutterImage, $angle, 0); //rotate
			$NewCutterX = imagesx($CutterImage);
			$NewCutterY = imagesy($CutterImage);
			$NewCutterImgDiffX = $NewCutterX - $CutterImgSizeX;
			$NewCutterImgDiffY = $NewCutterY - $CutterImgSizeY;
			$NewImageSizeAdditionX = ($NewCutterImgDiffX / $ImageToCutterXScale);
			$NewImageSizeAdditionY = ($NewCutterImgDiffY / $ImageToCutterYScale);
			$NewImageSizeX = ($NewImageSizeAdditionX + $ImageSizeX);
			$NewImageSizeY = ($NewImageSizeAdditionY + $ImageSizeY);
		//Get crop dimensions
			$CutterSrcX = ($NewCutterX / 2) - ($NewImageSizeX / 2);
			$CutterSrcY = ($NewCutterY / 2) - ($NewImageSizeY / 2);
			$newImage = imagecreate($NewImageSizeX , $NewImageSizeY);
			imagecopy($newImage, $CutterImage, 0, 0, $CutterSrcX, $CutterSrcY, $NewImageSizeX, $NewImageSizeY);
			imagedestroy($CutterImage);
		return $newImage;
	}

	private function handlePatchs() //Done
	{
		global $root;
		$this->sc29thPatch = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . '29th_Patch.png');
		imagecopy($this->scImage, $this->sc29thPatch, 0, 0, 0, 0, $this->scImgSize['x'], $this->scImgSize['y']);
		imagedestroy($this->sc29thPatch);
	}

	private function handleOfficerInsig() //Done
	{
		global $root;
		$this->scLapelCover = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Lapel_Cover.png');
		imagecopy($this->scImage, $this->scLapelCover, 0, 0, 0, 0, $this->scImgSize['x'], $this->scImgSize['y']);
		imagedestroy($this->scLapelCover);
		$this->scInsignia = strtolower($this->scInsignia);
		if($this->scInsignia == "747th"){
			$this->scArmorOfficer = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'InsigniaBranch/armor_officer.png');
			imagecopy($this->scImage, $this->scArmorOfficer, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
			imagedestroy($this->scArmorOfficer);
		}
		else{
			$this->scInfantryOfficer = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'InsigniaBranch/infantry_officer.png');	
			imagecopy($this->scImage, $this->scInfantryOfficer, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
			imagedestroy($this->scInfantryOfficer);
		}
		$this->scIsOfficer = true; //needed for croping
	}

	private function handleEnlistedInsig() //Done
	{
		global $root;
		$this->scLapelCover = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Lapel_Cover.png');
		imagecopy($this->scImage, $this->scLapelCover, 0, 0, 0, 0, $this->scImgSize['x'], $this->scImgSize['y']);
		imagedestroy($this->scLapelCover);
		$this->scInsignia = strtolower($this->scInsignia);
		if($this->scInsignia == "747th"){
			$this->scArmorEnlisted = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'InsigniaBranch/armor_enlisted.png');
			imagecopy($this->scImage, $this->scArmorEnlisted, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
			imagedestroy($this->scArmorEnlisted);
		}
		else{
			$this->scInfantryEnlisted = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'InsigniaBranch/infantry_enlisted.png');
			imagecopy($this->scImage, $this->scInfantryEnlisted, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
			imagedestroy($this->scInfantryEnlisted);	
		}				
	}

	private function handleRank() //Done
	{
		global $root;
		$this->scRank = strtolower($this->scRank);
		if(in_array($this->scRank,$this->scAllRanks))
		{
			switch($this->scRank){
			case 'pvt':
				$this->handleEnlistedInsig();			
			break;
			case 'pfc':
				$this->scRankpfc = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/PFC.png');
				imagecopy($this->scImage, $this->scRankpfc, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankpfc);
				$this->handleEnlistedInsig();				
			break;
			case 'cpl':
				$this->scRankcpl = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/CPL.png');
				imagecopy($this->scImage, $this->scRankcpl, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankcpl);
				$this->handleEnlistedInsig();		
			break;
			case 't5':
				$this->scRankt5 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/T5.png');
				imagecopy($this->scImage, $this->scRankt5, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankt5);
				$this->handleEnlistedInsig();	
			break;
			case 'sgt':
				$this->scRanksgt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/SGT.png');
				imagecopy($this->scImage, $this->scRanksgt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRanksgt);
				$this->handleEnlistedInsig();		
			break;
			case 't4':
				$this->scRankt4 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/T4.png');
				imagecopy($this->scImage, $this->scRankt4, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankt4);
				$this->handleEnlistedInsig();				
			break;
			case 'ssgt':
				$this->scRankssgt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/SSGT.png');
				imagecopy($this->scImage, $this->scRankssgt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankssgt);
				$this->handleEnlistedInsig();				
			break;
			case 't3':
				$this->scRankt3 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/T3.png');
				imagecopy($this->scImage, $this->scRankt3, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankt3);
				$this->handleEnlistedInsig();
			break;
			case 'tsgt':
				$this->scRanktsgt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/TSGT.png');
				imagecopy($this->scImage, $this->scRanktsgt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRanktsgt);				
				$this->handleEnlistedInsig();
			break;
			case 'msgt':
				$this->scRankmsgt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/MSGT.png');
				imagecopy($this->scImage, $this->scRankmsgt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankmsgt);
				$this->handleEnlistedInsig();				
			break;
			case 'fsgt':
				$this->scRankfsgt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksEnlisted/FSGT.png');
				imagecopy($this->scImage, $this->scRankfsgt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankfsgt);
				$this->handleEnlistedInsig();				
			break;
			case '2lt':
				$this->scRank2lt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksOfficer/2LT.png');
				imagecopy($this->scImage, $this->scRank2lt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRank2lt);	
				$this->handleOfficerInsig();						
			break;
			case '1lt':
				$this->scRank1lt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksOfficer/1LT.png');
				imagecopy($this->scImage, $this->scRank1lt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRank1lt);
				$this->handleOfficerInsig();			
			break;
			case 'cpt':
				$this->scRankcpt = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksOfficer/CPT.png');
				imagecopy($this->scImage, $this->scRankcpt, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankcpt);
				$this->handleOfficerInsig();
			break;
			case 'maj':
				$this->scRankmaj = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksOfficer/MAJ.png');
				imagecopy($this->scImage, $this->scRankmaj, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankmaj);
				$this->handleOfficerInsig();
			break;
			case 'lt col':
				$this->scRankltcol = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RanksOfficer/LTCOL.png');
				imagecopy($this->scImage, $this->scRankltcol, 0, 0, 0, 0, $this->scImgSize['x'],$this->scImgSize['y']);
				imagedestroy($this->scRankltcol);
				$this->handleOfficerInsig();	
			break;
			default:
			break;
			}
		}
		else
		{
			$this->handleEnlistedInsig(); //rank not given	
		}
		return true;
	}

	private function handleMarksmanBadges() //Done
	{
		global $root;
		if(count($this->scAQBadges) > 0)
		{
			$temp_image = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/expert_badge.png');
			$scMarksBadgeSize['x'] = imagesx($temp_image);
			$scMarksBadgeSize['y'] = imagesy($temp_image);
			imagedestroy($temp_image);
			$temp_image = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/rifle_clasps.png');
			$scClaspsSize['x'] = imagesx($temp_image);
			$scClaspsSize['y'] = imagesy($temp_image);
			imagedestroy($temp_image);
			$scMarksClaspsPos = array(
				'pos1' => array(
					'x' => '0',
					'y' => '45'),
				'pos2' => array(
					'x' => '0',
					'y' => '62'),
				'pos3' => array(
					'x' => '0',
					'y' => '79')
				);
			//Set of badges
			$scMarksBadgeArray = array(
				'slot1' => 0,
				'slot2' => 0,
				'slot3' => 0);
			//Initiates the Marksman Clasps Array
			$scNClaspsExpert = 1;
			$scNClaspsSharps = 1;
			$scNClaspsMarks = 1;

			//Setups up max personel awards
			$scExpertMarksBadge = array();
			$scSharpMarksBadge = array();
			$scMarksMarksBadge = array();
			$scFinalMarksBadge = array();
			$scPersonMarksBadge = array(
				'rifle' => NULL,
				'smg' => NULL,
				'bar' => NULL,
				'mg' => NULL,
				'zook' => NULL,
				'armor' => NULL,
				'sniper' => NULL,
				'mortar' => NULL
				);
				
			foreach($this->scAQBadges as $badge)
			{
				$scBadgeAttr = explode(':',$badge);
				$scBadgeType = $scBadgeAttr[1];
				//e:armor:dh
				
				switch($scBadgeAttr[0])
				{
					case 'm':
						array_push($scMarksMarksBadge, $badge);			
					break;
					case 's':
						array_push($scSharpMarksBadge, $badge);	
					break;
					case 'e':
						array_push($scExpertMarksBadge, $badge);	
					break;
				}
			}
			foreach($scMarksMarksBadge as $badge)
			{
				$scBadgeAttr = explode(':',$badge);
				$scBadgeType = $scBadgeAttr[1];
				
				$scPersonMarksBadge[$scBadgeType] = $badge;
			}
			foreach($scSharpMarksBadge as $badge)
			{
				$scBadgeAttr = explode(':',$badge);
				$scBadgeType = $scBadgeAttr[1];
				
				$scPersonMarksBadge[$scBadgeType] = $badge;
			}
			foreach($scExpertMarksBadge as $badge)
			{
				$scBadgeAttr = explode(':',$badge);
				$scBadgeType = $scBadgeAttr[1];
				
				$scPersonMarksBadge[$scBadgeType] = $badge;
			}		

			foreach($scPersonMarksBadge as $key => $badge)
			{
				if($badge != NULL)
				{
					array_push($scFinalMarksBadge, $badge);
				}
			}
			foreach($scFinalMarksBadge as $key => $badge)
			{		
				$scBadgeAttr = explode(':',$badge);
				switch($scBadgeAttr[1])
				{
					case 'rifle':
						$scClaspsList['rifle'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/rifle_clasps.png');
					break;
					case 'smg':
						$scClaspsList['smg'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/submachinegun_clasps.png');
					break;
					case 'mg':
						$scClaspsList['mg'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/machinegun_clasps.png');
					break;
					case 'bar':
						$scClaspsList['bar'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/autorifle_clasps.png');
					break;
					case 'zook':
						$scClaspsList['zook'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/antitank_clasps.png');
					break;
					case 'armor':
						$scClaspsList['armor'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/armor_clasps.png');
					break;
					case 'sniper':
						$scClaspsList['sniper'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/sniper_clasps.png');
					break;
					case 'mortar':
						$scClaspsList['mortar'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/mortar_clasps.png');
					break;
					default: break;
				}
				//Which clasps variables
				switch($scBadgeAttr[0])
				{
					case 'e':
						switch($scNClaspsExpert)
						{
							case 1:
								$scMarksBadgeArray['slot1'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/expert_badge.png');
						imagecopy($scMarksBadgeArray['slot1'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos1']['x'], $scMarksClaspsPos['pos1']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
								$scNClaspsExpert++;
							break;
							case 2:
						imagecopy($scMarksBadgeArray['slot1'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos2']['x'], $scMarksClaspsPos['pos2']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
								$scNClaspsExpert++;
							break;
							case 3:
						imagecopy($scMarksBadgeArray['slot1'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos3']['x'], $scMarksClaspsPos['pos3']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
								$scNClaspsExpert++;
							break;
							default:
								$scNClaspsExpert = 'done'; //too many clasps						
							break;
						}
						$numMarksBArray[0] = 1;
					break;
					case 's':											
						switch($scNClaspsSharps)
						{
						case 1:
							$scMarksBadgeArray['slot2'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/sharpshooter_badge.png');
						imagecopy($scMarksBadgeArray['slot2'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos1']['x'], $scMarksClaspsPos['pos1']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
							$scNClaspsSharps++;
						break;
						case 2:
						imagecopy($scMarksBadgeArray['slot2'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos2']['x'], $scMarksClaspsPos['pos2']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
							$scNClaspsSharps++;
						break;
						case 3:
						imagecopy($scMarksBadgeArray['slot2'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos3']['x'], $scMarksClaspsPos['pos3']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
							$scNClaspsSharps++;
						break;
						default:
							$scNClaspsSharps = 'done'; //too many clasps
						break;
						}
						$numMarksBArray[1] = 1;
					break;
					case 'm':
						switch($scNClaspsMarks)
						{
						case 1:
							$scMarksBadgeArray['slot3'] = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesAQB/marksman_badge.png');
						imagecopy($scMarksBadgeArray['slot3'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos1']['x'], $scMarksClaspsPos['pos1']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
							$scNClaspsMarks++;
						break;
						case 2:		
						imagecopy($scMarksBadgeArray['slot3'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos2']['x'], $scMarksClaspsPos['pos2']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
							$scNClaspsMarks++;
						break;
						case 3:
						imagecopy($scMarksBadgeArray['slot3'], $scClaspsList[$scBadgeAttr[1]], $scMarksClaspsPos['pos3']['x'], $scMarksClaspsPos['pos3']['y'], 0, 0, $scClaspsSize['x'], $scClaspsSize['y']);
							$scNClaspsMarks++;
						break;
						default:
							$scNClaspsMarks = 'done'; //too many clasps
						break;
						}
						$numMarksBArray[2] = 1;
					break;
					default:
					break;
				}
				imagedestroy($scClaspsList[$scBadgeAttr[1]]);
			}
			//Number of badges
			$numMarksBadges = count($numMarksBArray);	
			$scMarksBadgeXPos = array();
			$scMarksBadgeXCurrent;
			$scMarksCurrentBadge = 1;
			switch($numMarksBadges)
			{
				case 1:
					$scMarksBadgeXPos[0] = $this->scMidMarksPos['x'] - ($scMarksBadgeSize['x'] / 2);
				break;
				case 2:
					$scMarksBadgeXPos[0] = $this->scMidMarksPos['x'] - $scMarksBadgeSize['x'] - 7;
					$scMarksBadgeXPos[1] = $this->scMidMarksPos['x'];
				break;
				case 3:
					$scMarksBadgeXPos[0] = $this->scMidMarksPos['x'] - $scMarksBadgeSize['x'] - ($scMarksBadgeSize['x'] / 2) - 7;
					$scMarksBadgeXPos[1] = $this->scMidMarksPos['x'] - ($scMarksBadgeSize['x'] / 2);
					$scMarksBadgeXPos[2] = $this->scMidMarksPos['x'] + ($scMarksBadgeSize['x'] / 2) + 7;
				break;
				default:
				break;				
			}
			foreach($scMarksBadgeArray as $badge => $resource)
			{
				if($scMarksBadgeArray[$badge] != 0)
				{
					switch($scMarksCurrentBadge)
					{
						case 1:
							$scMarksBadgeXCurrent = $scMarksBadgeXPos[0];
						break;
						case 2:
							$scMarksBadgeXCurrent = $scMarksBadgeXPos[1];
						break;
						case 3:
							$scMarksBadgeXCurrent = $scMarksBadgeXPos[2];
						break;
						default:
							echo "ERROR: AQB Problem";
						break;
					}
					$scMarksCurrentBadge++;
					imagecopy($this->scImage, $resource, $scMarksBadgeXCurrent, $this->scMidMarksPos['y'], 0, 0, $scMarksBadgeSize['x'], $scMarksBadgeSize['y']);
					imagedestroy($resource);
				}
			}
		}
		return true;
	}

	private function handleTopRightAwards() //Done
	{
		global $root;
		if(count($this->scARibbons) > 0)
		{
			$temp_img = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/French Croix de Guerre Medal.png');
			$scRibSize['x'] = imagesx($temp_img);
			$scRibSize['y'] = imagesy($temp_img);
			imagedestroy($temp_img);
			$scRibAwards = array(
				'french' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/French Croix de Guerre Medal.png')
					),
				'ww1v' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/WWI Victory Medal.png')
					),
				'aocc' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Army of Occupation Medal.png')
					),
				'eamc' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/European-African-Middle Eastern Campaign Medal.png')
					),
				'acamp' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/American Campaign Medal.png')
					),
				'adef' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/American Defense Service Medal.png')
					),
				'gcon' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Good Conduct Medal.png')
					),	
				'aach' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Army Achievement Medal.png')
					),
				'arcom' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Army Commendation Medal.png')
					),
				'anpdr' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Army NCO Professional Development Ribbon.png')
					),
				'pheart' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Purple Heart.png')
					),
				'bstar' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Bronze Star.png')
					),
				'sm' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Soldiers Medal.png')
					),
				'lom' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Legion of Merit.png')
					),
				'sstar' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Silver Star.png')
					),
				'dsm' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Distinguished Service Medal.png')
					),
				'dsc' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Distinguished Service Cross.png')
					),
				'ww2v' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/WWII Victory Medal.png')
					),
				'dms' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Defense Meritorious Service Medal Ribbon.png')
					),
				'movsm' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Military Outstanding Volunteer Service Medal.png')
					),
				'arcam' => array(
					'num' => 0,
					'img' => imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Army Reserve Components Achievement Medal.png')
					)
				);
			//Initiates the RibArray
			foreach($this->scARibbons as $award)
			{
				if(array_key_exists($award,$scRibAwards)) {
					$scRibAwards[$award]['num']++;
				}
			}
			//Pos Variables
			$scCurrentRibXpos = array();
			$scCurrentRib = 1;
			$scCurrentRow = 1;
			$scRibAmount = 0;
			//Get how many ribbons
			foreach($scRibAwards as $award => $num){
				if($scRibAwards[$award]['num']) $scRibAmount++;
			}	
			//Set some Row Settings
			$scRibRows = floor($scRibAmount / 3); //Get amount of rows
			$scRibRemain = ($scRibAmount % 3); //Get remainder
			if($scRibRemain == 0) $scRibRemain = $scRibAmount;
			$scRibShadowImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Ribbons/Ribbon_Shadow.png');
			foreach($scRibAwards as $award => $num)
			{
				if($scRibAwards[$award]['num']){
					//Determine current row size
					if($scCurrentRow == ($scRibRows + 1)){
						$scCurrentRowSize = $scRibRemain;
					}
					else{
						$scCurrentRowSize = 3;
					}
					//Set X Positions
					switch($scCurrentRowSize){
						case 0:
						break;
						case 1:
							$scCurrentRibXpos[0] = $this->scMidRibPos['x'] - ($scRibSize['x'] / 2) + 2;
						break;
						case 2:
							$scCurrentRibXpos[0] = $this->scMidRibPos['x'] + 1;
							$scCurrentRibXpos[1] = $this->scMidRibPos['x'] - $scRibSize['x'] + 1;
						break;
						case 3:
							$scCurrentRibXpos[0] = $this->scMidRibPos['x'] + ($scRibSize['x'] / 2) + 2;
							$scCurrentRibXpos[1] = $this->scMidRibPos['x'] - ($scRibSize['x'] / 2) + 2;
							$scCurrentRibXpos[2] = $this->scMidRibPos['x'] - $scRibSize['x'] - ($scRibSize['x'] / 2) + 2;
						break;
						default:
						break;				
					}
					//Choose X Positions
					switch($scCurrentRib){
						case 1:
							$scCurrentRibX = $scCurrentRibXpos[0];
						break;
						case 2:
							$scCurrentRibX = $scCurrentRibXpos[1];
						break;
						case 3:
							$scCurrentRibX = $scCurrentRibXpos[2];
						break;	
						default:
						break;
					}
					//Y Setting
					$scCurrentRibY = $this->scMidRibPos['y'] - ($scCurrentRow * $scRibSize['y']) + 2;
					//X & Y Offsets
					$scCurrentRib++;
					if($scCurrentRib > 3){
						$scCurrentRib = 1;
						$scCurrentRow++;
					}				
					imagecopy($this->scImage, $scRibShadowImage, $scCurrentRibX, $scCurrentRibY, 0, 0, $scRibSize['x'], $scRibSize['y']);//print medal
				}				
			}
			imagedestroy($scRibShadowImage); //destroys unneeded image for memory
			$scCurrentRib = 1; //reset
			$scCurrentRow = 1; //reset
			foreach($scRibAwards as $award => $num)
			{
				if($scRibAwards[$award]['num']){
						//Determine current row size
						if($scCurrentRow == ($scRibRows + 1)){
							$scCurrentRowSize = $scRibRemain;
						}
						else{
							$scCurrentRowSize = 3;
						}
						//Set X Positions
						switch($scCurrentRowSize){
							case 0:
							break;
							case 1:
								$scCurrentRibXpos[0] = $this->scMidRibPos['x'] - ($scRibSize['x'] / 2);
							break;
							case 2:
								$scCurrentRibXpos[0] = $this->scMidRibPos['x'];
								$scCurrentRibXpos[1] = $this->scMidRibPos['x'] - $scRibSize['x'];
							break;
							case 3:
								$scCurrentRibXpos[0] = $this->scMidRibPos['x'] + ($scRibSize['x'] / 2);
								$scCurrentRibXpos[1] = $this->scMidRibPos['x'] - ($scRibSize['x'] / 2);
								$scCurrentRibXpos[2] = $this->scMidRibPos['x'] - $scRibSize['x'] - ($scRibSize['x'] / 2);
							break;
							default:
							break;				
						}
						//Choose X Positions
						switch($scCurrentRib)
						{
							case 1:
								$scCurrentRibX = $scCurrentRibXpos[0];
							break;
							case 2:
								$scCurrentRibX = $scCurrentRibXpos[1];
							break;
							case 3:
								$scCurrentRibX = $scCurrentRibXpos[2];
							break;	
							default:
							break;
						}
						$scCurrentRibY = $this->scMidRibPos['y'] - ($scCurrentRow * $scRibSize['y']); //Y Setting
						//X & Y Offsets
						$scCurrentRib++;
						if($scCurrentRib > 3){
							$scCurrentRib = 1;
							$scCurrentRow++;
						}
						if($scRibAwards[$award]['num'] > 1) {
							// print medal with oak leaf
							$leaf = min(10, $scRibAwards[$award]['num']-1); // we only have images from 1-10
							$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_' . $leaf . '.png');
							imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
							imagedestroy($this->scOakLeaf);
						}
						/*switch($scRibAwards[$award]['num'])
						{
							case 1:
								// print regular medal (no oak leafs)
							break;
							case 2:
								// print medal with oak leaf
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_1.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 3:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_2.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 4:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_3.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 5:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_4.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 6:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_5.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 7:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_6.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 8:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_7.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 9:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_8.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 10:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_9.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							case 11:
								$this->scOakLeaf = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'OakLeafs/ol_10.png');
								imagecopy($scRibAwards[$award]['img'], $this->scOakLeaf, 0, 0, 0, 0, $scRibSize['x'], $scRibSize['y']);
								imagedestroy($this->scOakLeaf);
							break;
							//default:	
							//	echo "ERROR Ribbons (" . $scRibAwards[$award]['num'] . ")";
							break;	
						}*/
						imagecopy($this->scImage, $scRibAwards[$award]['img'], $scCurrentRibX, $scCurrentRibY, 0, 0, $scRibSize['x'], $scRibSize['y']);//print medal
				}	
				imagedestroy($scRibAwards[$award]['img']); //destroys unneeded image for memory
			}
		}
		//----------------//
		//Start TR Badges //
		//----------------//
		if(count($this->scTRBadges) > 0)
		{
			$scCIBadges =  array(	
				'cib4' => 0,
				'cib3' => 0,
				'cib2' => 0,
				'cib1' => 0, //same as CIB
				'cib' => 0,
				'eib' => 0
				);
			$scCABadges = array(
				'cab4' => 0,
				'cab3' => 0,
				'cab2' => 0,
				'cab1' => 0, //same as CAB
				'cab' => 0
				);
			//Initiates both arrays
			foreach($this->scTRBadges as $badge)
			{
				if(array_key_exists($badge,$scCIBadges)) 
				{
					$scCIBadges[$badge]++;
				}
				if(array_key_exists($badge,$scCABadges)) 
				{
					$scCABadges[$badge]++;
				}
			}
			//Gets place with ribbons in consideration
			if($scRibRows == NULL) $scRibRows = 0;
			if($scRibRemain == NULL) $scRibRemain = 0;
			$scTRCurrentBadge = 1;
			$scARRibbonRows = $scRibRows;
			if($scRibRemain > 0 && $scRibRemain < 3) $scARRibbonRows = $scRibRows + 1;
			//Combat Infantry Positioning
			$temp_ciimage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/CIB_4.png');
			$scCIBadgeSize['x'] = imagesx($temp_ciimage);
			$scCIBadgeSize['y'] = imagesy($temp_ciimage);
			imagedestroy($temp_ciimage);
			$scCIBadgeCurrentX = $this->scMidRibPos['x'] - ($scCIBadgeSize['x'] / 2);
			$scCIBadgeCurrentY = $this->scMidRibPos['y'] - $scCIBadgeSize['y'] - ($scARRibbonRows * $scRibSize['y']) - $this->scFourthInch;
			$scCAExists = array_sum($scCABadges);
			if($scARRibbonRows >= 3 || $scCAExists > 0){
				$scCIBadgeCurrentX = $this->scMidRibPos['x'] + $scRibSize['x'] - ($scCIBadgeSize['x'] / 2);
			}
			$scEIBUsed = false;
			//Combat Infantry Drawing
			foreach($scCIBadges as $badge => $value)
			{
				if($value >= 1){
					switch($badge){
						case 'cib4':
							$this->scARBadgeCIB4 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/CIB_4.png');
							imagecopy($this->scImage, $this->scARBadgeCIB4, $scCIBadgeCurrentX, $scCIBadgeCurrentY, 0, 0, $scCIBadgeSize['x'], $scCIBadgeSize['y']);
							imagedestroy($this->scARBadgeCIB4);
							$scTRCurrentBadge++;
						break;
						case 'cib3':
							$this->scARBadgeCIB3 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/CIB_3.png');
							imagecopy($this->scImage, $this->scARBadgeCIB3, $scCIBadgeCurrentX, $scCIBadgeCurrentY, 0, 0, $scCIBadgeSize['x'], $scCIBadgeSize['y']);
							imagedestroy($this->scARBadgeCIB3);
							$scTRCurrentBadge++;
						break;
						case 'cib2':
							$this->scARBadgeCIB2 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/CIB_2.png');
							imagecopy($this->scImage, $this->scARBadgeCIB2, $scCIBadgeCurrentX, $scCIBadgeCurrentY, 0, 0, $scCIBadgeSize['x'], $scCIBadgeSize['y']);
							imagedestroy($this->scARBadgeCIB2);
							$scTRCurrentBadge++;
						break;
						case 'cib1':
							$this->scARBadgeCIB1 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/CIB_1.png');
							imagecopy($this->scImage, $this->scARBadgeCIB1, $scCIBadgeCurrentX, $scCIBadgeCurrentY, 0, 0, $scCIBadgeSize['x'], $scCIBadgeSize['y']);
							imagedestroy($this->scARBadgeCIB1);
							$scTRCurrentBadge++;
						break;
						case 'cib':
							$this->scARBadgeCIB1 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/CIB_1.png');
							imagecopy($this->scImage, $this->scARBadgeCIB1, $scCIBadgeCurrentX, $scCIBadgeCurrentY, 0, 0, $scCIBadgeSize['x'], $scCIBadgeSize['y']);
							imagedestroy($this->scARBadgeCIB1);
							$scTRCurrentBadge++;
						break;
						case 'eib':
							$this->scARBadgeEIB = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesEIB&CIB/EIB.png');
							imagecopy($this->scImage, $this->scARBadgeEIB, $scCIBadgeCurrentX, $scCIBadgeCurrentY, 0, 0, $scCIBadgeSize['x'], $scCIBadgeSize['y']);
							imagedestroy($this->scARBadgeEIB);
							$scTRCurrentBadge++;
							$scEIBUsed = true;
						break;
						default:
						break;
					}
					break;
				}
			}
			//Combat Action Positioning
			$temp_caimage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesCAB/CAB4.png');
			$scCABadgeSize['x'] = imagesx($temp_caimage);
			$scCABadgeSize['y'] = imagesy($temp_caimage);
			imagedestroy($temp_caimage);
			$scCABadgeCurrentX = $this->scMidRibPos['x'] - ($scCABadgeSize['x'] / 2);
			$scCABadgeCurrentY = $this->scMidRibPos['y'] - $scCABadgeSize['y'] - ($scARRibbonRows * $scRibSize['y']) - $this->scFourthInch;
			if($scTRCurrentBadge > 1) $scCABadgeCurrentY = $scCABadgeCurrentY - $scCIBadgeSize['y'];
			$scCIExists = array_sum($scCIBadges);
			if($scARRibbonRows >= 4 || $scCIExists > 0){
				$scCABadgeCurrentX = $this->scMidRibPos['x'] + $scRibSize['x'] - ($scCABadgeSize['x'] / 2);
			}
			if($scEIBUsed) $scCABadgeCurrentY = $scCABadgeCurrentY + 20;
			//Combat Action Drawing
			foreach($scCABadges as $badge => $value)
			{
				if($value >= 1){
					switch($badge){
						case 'cab4':
							$this->scARBadgeCAB4 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesCAB/CAB4.png');
							imagecopy($this->scImage, $this->scARBadgeCAB4, $scCABadgeCurrentX, $scCABadgeCurrentY, 0, 0, $scCABadgeSize['x'], $scCABadgeSize['y']);
							imagedestroy($this->scARBadgeCAB4);
						break;
						case 'cab3':
							$this->scARBadgeCAB3 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesCAB/CAB3.png');
							imagecopy($this->scImage, $this->scARBadgeCAB3, $scCABadgeCurrentX, $scCABadgeCurrentY, 0, 0, $scCABadgeSize['x'], $scCABadgeSize['y']);
							imagedestroy($this->scARBadgeCAB3);
						break;
						case 'cab2':
							$this->scARBadgeCAB2 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesCAB/CAB2.png');
							imagecopy($this->scImage, $this->scARBadgeCAB2, $scCABadgeCurrentX, $scCABadgeCurrentY, 0, 0, $scCABadgeSize['x'], $scCABadgeSize['y']);
							imagedestroy($this->scARBadgeCAB2);
						break;
						case 'cab1':
							$this->scARBadgeCAB1 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesCAB/CAB1.png');
							imagecopy($this->scImage, $this->scARBadgeCAB1, $scCABadgeCurrentX, $scCABadgeCurrentY, 0, 0, $scCABadgeSize['x'], $scCABadgeSize['y']);
							imagedestroy($this->scARBadgeCAB1);
						break;
						case 'cab':
							$this->scARBadgeCAB1 = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesCAB/CAB1.png');
							imagecopy($this->scImage, $this->scARBadgeCAB1, $scCABadgeCurrentX, $scCABadgeCurrentY, 0, 0, $scCABadgeSize['x'], $scCABadgeSize['y']);
							imagedestroy($this->scARBadgeCAB1);
						break;
						default:
						break;
					}
					break;
				}
			}
		}
	}

	private function handleTopLeftAwards() //Done
	{
		global $root;
		if(count($this->scURibbons) > 0)
		{
			$scURibRibbons = array(
				'battlegrounds' => 0,
				'trenches' => 0,
				'dod' => 0,
				'dh' => 0,
				'muc' => 0,
				'rs' => 0,
				'arma' => 0
				);
			foreach($this->scURibbons as $ribbon)
			{
				if(array_key_exists($ribbon,$scURibRibbons)) 
				{
					$scURibRibbons[$ribbon]++;
				}
			}
			//Get how many ribbons
			$scNumURibbons = 0;
			foreach($scURibRibbons as $ribbon => $value)
			{
				if($value > 0) $scNumURibbons++;
			}			
			//set positions
			$scURibMidPos = array('x' => '219', 'y' => '314');
			$scURibbonSize['x'] = 42;
			$scURibbonSize['y'] = 17;
			$scCurrentURibXpos = array();
			$scCurrentURibX;
			$scCurrentURibY;
			$scCurrentURib = 1;
			$scCurrentURow = 1;
			$scMaxURibPR = 3;
			$scCurrentRowSize = 0;
			//Set some Row Settings
			$scURibRows = floor($scNumURibbons / $scMaxURibPR); //Get amount of rows
			$scURibRemain = ($scNumURibbons % $scMaxURibPR); //Get remainder
			if($scURibRemain == 0) $scURibRemain = $scNumURibbons;		
			$scURibShadow = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/Uribbon_Shadow.png');
			foreach($scURibRibbons as $ribbon => $num)
			{
				if($num > 0)
				{
					//Determine current row size
					if($scCurrentURow == ($scURibRows + 1))
					{
						$scCurrentRowSize = $scURibRemain;
					}
					else
					{
						$scCurrentRowSize = $scMaxURibPR;
					}
					//Set X Positions
					switch($scCurrentRowSize)
					{
						case 0:
						break;
						case 1:
							$scCurrentURibXpos[0] = $scURibMidPos['x'] - ($scURibbonSize['x'] / 2) + 2;
						break;
						case 2:
							$scCurrentURibXpos[1] = $scURibMidPos['x'] - $scURibbonSize['x'] + 2;
							$scCurrentURibXpos[0] = $scURibMidPos['x'] + 2;
						break;
						case 3:
							$scCurrentURibXpos[2] = $scURibMidPos['x'] - ($scURibbonSize['x'] + ($scURibbonSize['x'] / 2)) + 2;
							$scCurrentURibXpos[1] = $scURibMidPos['x'] - ($scURibbonSize['x'] / 2) + 2;
							$scCurrentURibXpos[0] = $scURibMidPos['x'] + ($scURibbonSize['x'] / 2) + 2;
						break;
						default:
						break;				
					}
					//Choose X Positions
					switch($scCurrentURib)
					{
						case 1:
							$scCurrentURibX = $scCurrentURibXpos[0];
						break;
						case 2:
							$scCurrentURibX = $scCurrentURibXpos[1];
						break;
						case 3:
							$scCurrentURibX = $scCurrentURibXpos[2];
						break;	
						default:
						break;
					}
					//Y Setting
					$scCurrentURibY = $scURibMidPos['y'] - ($scCurrentURow * $scURibbonSize['y']) + 2;
					//X & Y Offsets
					$scCurrentURib++;
					if($scCurrentURib > $scMaxURibPR)
					{
						$scCurrentURib = 1;
						$scCurrentURow++;
					}
					
					imagecopy($this->scImage, $scURibShadow, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
				}	
			}
			imagedestroy($scURibShadow);
			$scCurrentURib = 1;  //reset
			$scCurrentURow = 1; //reset
			foreach($scURibRibbons as $ribbon => $num)
			{
				if($num > 0)
				{
					//Determine current row size
					if($scCurrentURow == ($scURibRows + 1))
					{
						$scCurrentRowSize = $scURibRemain;
					}
					else
					{
						$scCurrentRowSize = $scMaxURibPR;
					}
					//Set X Positions
					switch($scCurrentRowSize)
					{
						case 0:
						break;
						case 1:
							$scCurrentURibXpos[0] = $scURibMidPos['x'] - ($scURibbonSize['x'] / 2);
						break;
						case 2:
							$scCurrentURibXpos[1] = $scURibMidPos['x'] - $scURibbonSize['x'];
							$scCurrentURibXpos[0] = $scURibMidPos['x'];
						break;
						case 3:
							$scCurrentURibXpos[2] = $scURibMidPos['x'] - ($scURibbonSize['x'] + ($scURibbonSize['x'] / 2));
							$scCurrentURibXpos[1] = $scURibMidPos['x'] - ($scURibbonSize['x'] / 2);
							$scCurrentURibXpos[0] = $scURibMidPos['x'] + ($scURibbonSize['x'] / 2);
						break;
						default:
						break;				
					}
					//Choose X Positions
					switch($scCurrentURib)
					{
						case 1:
							$scCurrentURibX = $scCurrentURibXpos[0];
						break;
						case 2:
							$scCurrentURibX = $scCurrentURibXpos[1];
						break;
						case 3:
							$scCurrentURibX = $scCurrentURibXpos[2];
						break;	
						default:
						break;
					}
					//Y Setting
					$scCurrentURibY = $scURibMidPos['y'] - ($scCurrentURow * $scURibbonSize['y']);
					//X & Y Offsets
					$scCurrentURib++;
					if($scCurrentURib > $scMaxURibPR)
					{
						$scCurrentURib = 1;
						$scCurrentURow++;
					}
					switch($ribbon)
					{
					    case 'arma':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/arma.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
						break;
						case 'rs':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/rs.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
					    break;
						case 'dh':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/darkesthour.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
						break;
						case 'dod':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/dayofdefeat.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
						break;
						case 'trenches':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/thetrenches.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
						break;
						case 'battlegrounds':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/battlegrounds.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
						break;
						case 'muc':
							$this->scURib = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'RibbonsCUC/MeritoriousUnitCitation.png');
							imagecopy($this->scImage, $this->scURib, $scCurrentURibX, $scCurrentURibY, 0, 0, $scURibbonSize['x'], $scURibbonSize['y']);
							imagedestroy($this->scURib);
						break;
						default:
						break;
					}
				}	
			}
		}
		//Ruptured Duck
		if(count($this->scTLBadges) > 0)
		{
			foreach($this->scTLBadges as $badge)
			{
				switch($badge)
				{
					case 'rd':
						$scTLRibbonRows = $scURibRows;
						if($scURibRemain > 0 && $scURibRemain < 3)
						{
							$scTLRibbonRows = $scURibRows + 1;
						}
						$this->scTLrupduck = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/RupturedDuck.png');
						$scRupturedDuckSizeX = imagesx($this->scTLrupduck);
						$scRupturedDuckSizeY = imagesy($this->scTLrupduck);
						$scRupturedDuckX = ($scURibMidPos['x'] - ($scRupturedDuckSizeX / 2));
						$scRupturedDuckY = $scURibMidPos['y'] - ($scTLRibbonRows * $scURibbonSize['y'] + $scRupturedDuckSizeY) - $this->scFourthInch;
						imagecopy($this->scImage, $this->scTLrupduck, $scRupturedDuckX, $scRupturedDuckY, 0, 0, $scRupturedDuckSizeX, $scRupturedDuckSizeY);
						imagedestroy($this->scTLrupduck);
					break;
					default:
					break;
				}
			}
		}
	}

	private function handleLeftPocketAwards() //Done
	{
		global $root;
		if(count($this->scBLBadges) > 0)
		{	
			foreach($this->scBLBadges as $badge)
			{
				switch($badge)
				{
					case 'drillsergeant':
						$this->scBLDrillSergeantB = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/DI.png');
						$scBLDSSize['x'] = imagesx($this->scBLDrillSergeantB);
						$scBLDSSize['y'] = imagesy($this->scBLDrillSergeantB);
						$scBLDSPos['x'] = 215 - ($scBLDSSize['x'] / 2);
						$scBLDSPos['y'] = 478 - ($scBLDSSize['y'] / 2);
						imagecopy($this->scImage, $this->scBLDrillSergeantB, $scBLDSPos['x'], $scBLDSPos['y'], 0, 0, $scBLDSSize['x'], $scBLDSSize['y']);
						imagedestroy($this->scBLDrillSergeantB);
					break;
					default:
					break;
				}
			}
		}
	}

	private function handleRightPocketAwards() //Done
	{
		global $root;
		if(count($this->scBRBadges) > 0)
		{
			$scBRArrayRB = array(
				'recruiter5' => 0,
				'recruiter4' => 0,
				'recruiter3' => 0,
				'recruiter2' => 0,
				'recruiter' => 0
				);
			$scBRMidPos['x'] = 545;
			$scBRMidPos['y'] = 468;
			$scBRSpacing = 10;
			foreach($this->scBRBadges as $badge)
			{
				if(array_key_exists($badge,$scBRArrayRB)) 
				{
					$scBRArrayRB[$badge]++;
				}
			}
			$scNumBRBadges = 0;			
			$scBRActual = array();
			//get highest rb
			foreach($scBRArrayRB as $badge => $num)
			{	
				if($num > 0)
				{
					switch($badge)
					{
						case recruiter5:
							$this->scRBImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/RB5.png');
							$scRBImage['x'] = imagesx($this->scRBImage);
							$scRBImage['y'] = imagesy($this->scRBImage);
						break;
						case recruiter4:
							$this->scRBImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/RB4.png');
							$scRBImage['x'] = imagesx($this->scRBImage);
							$scRBImage['y'] = imagesy($this->scRBImage);
						break;
						case recruiter3:
							$this->scRBImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/RB3.png');
							$scRBImage['x'] = imagesx($this->scRBImage);
							$scRBImage['y'] = imagesy($this->scRBImage);
						break;
						case recruiter2:
							$this->scRBImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/RB2.png');
							$scRBImage['x'] = imagesx($this->scRBImage);
							$scRBImage['y'] = imagesy($this->scRBImage);
						break;
						case recruiter:
							$this->scRBImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/RB1.png');
							$scRBImage['x'] = imagesx($this->scRBImage);
							$scRBImage['y'] = imagesy($this->scRBImage);
						break;
						default:						
						break;
					}
					$scBRActual[rb] = 1;
					$scBRRBBadge = true;
					break;
				}
			}
			if(in_array(mp,$this->scBRBadges)) $scBRMPBadge = true;
			if($scBRRBBadge) $scNumBRBadges++;
			if($scBRMPBadge) $scNumBRBadges++; 
			if($scBRMPBadge)
			{
				$this->scMPImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'BadgesOther/MP.png');
				$scMPImage['x'] = imagesx($this->scMPImage);
				$scMPImage['y'] = imagesy($this->scMPImage);
				$scBRActual[mp] = 1;
			}
			$scCurrentBRBadge = 1;
			foreach($scBRActual as $badge => $num)
			{				
				switch($scNumBRBadges)
				{
					case 1:
						switch($badge)
						{
							case rb:
								$scBRXPos = $scBRMidPos['x'] - ($scRBImage['x'] / 2);
								$scBRYPos = $scBRMidPos['y'] - ($scRBImage['y'] / 2);
								imagecopy($this->scImage, $this->scRBImage, $scBRXPos, $scBRYPos, 0, 0, $scRBImage['x'], $scRBImage['y']);
								imagedestroy($this->scRBImage);
							break;
							case mp:
								$scBRXPos = $scBRMidPos['x'] - ($scMPImage['x'] / 2);
								$scBRYPos = $scBRMidPos['y'] - ($scMPImage['y'] / 2);
								imagecopy($this->scImage, $this->scMPImage, $scBRXPos, $scBRYPos, 0, 0, $scMPImage['x'], $scMPImage['y']);
								imagedestroy($this->scMPImage);
							break;
							default:
								
							break;
						}
					break;
					case 2:
						switch($badge)
						{
							case rb:
								$scBRXPos = $scBRMidPos['x'] - $scRBImage['x'] - $scBRSpacing;
								$scBRYPos = $scBRMidPos['y'] - ($scRBImage['y'] / 2);
								imagecopy($this->scImage, $this->scRBImage, $scBRXPos, $scBRYPos, 0, 0, $scRBImage['x'], $scRBImage['y']);
								imagedestroy($this->scRBImage);
							break;
							case mp:
								$scBRXPos = $scBRMidPos['x'] + $scBRSpacing;
								$scBRYPos = $scBRMidPos['y'] - ($scMPImage['y'] / 2);
								imagecopy($this->scImage, $this->scMPImage, $scBRXPos, $scBRYPos, 0, 0, $scMPImage['x'], $scMPImage['y']);
								imagedestroy($this->scMPImage);
							break;
							default:
							break;
						}
					break;
					default:
					break;				
				}	
			}	
		}
	}

	private function checkAccess()
	{
		global $root;
		if($this->scAccess == sc29th){
			return true;
		}
		else{
			$this->scWaterMark = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'Watermark/29th_watermark.png');
			imagecopy($this->scImage, $this->scWaterMark, 0, 0, 0, 0, $this->scImgSize['x'], $this->scImgSize['y']);
			imagedestroy($this->scWaterMark);
		}
	}

	public function compileJacket()
	{
		global $root;
		//Setup Enlisted/Officer Jacket
			if($this->getIsOfficer($this->scRank))
			{
				$this->scImage = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . '29th_ServiceOfficerJacket.png');
			}
		//Handle Name
			$imageForText = imagecreatefrompng(getenv('DIR_COAT_RESOURCES') . 'blank_name.png'); //sets up image for name
			$scNameColor2 = imagecolorallocate($imageForText, 219, 219, 219); //initiates color used for text
			$this->imageftboxtoImage($imageForText, getenv('DIR_COAT_RESOURCES') . 'Fonts/arial.ttf', 12, 0, 50, 150, 0, ALIGN_CENTER, VALIGN_MIDDLE, $this->scName, $scNameColor2);
			$imageForText = $this->imagetransrotate($imageForText, 1);
			imagecopy($this->scImage, $imageForText, 143, 320, 0, 0, $this->scImgSize['x'], $this->scImgSize['y']);
			imagedestroy($imageForText);
		//Handle Flair
			$this->handleTopRightAwards();
			$this->handleTopLeftAwards();
			$this->handleLeftPocketAwards();
			$this->handleRightPocketAwards();
			$this->handleRank();
			$this->handlePatchs();
			$this->handleMarksmanBadges();
			//$this->checkAccess();
		//Handle Saving and Croping
			//$name_String = $root . "coats/";
			$name_String = getenv('DIR_COAT_PUBLIC');
			$name_StringSig = "sig";
			$name_String2 = ".png";
		//Croping Variables
			if($this->scIsOfficer == true){
				$CropStartY = 130;
				$CropHeight = 312; 
			}
			else{
				$CropStartY = 199;
				$CropHeight = 312;
			}
		//Positioning, Alpha, Crop, & Output
			$imageSigX = imagesx($this->scImageSig);
			$imageSigY = imagesy($this->scImageSig);
			imagesavealpha($this->scImage, true);
			imagesavealpha($this->scImageSig, true );
			$alpha = imagecolorallocatealpha($this->scImageSig, 0, 0, 0, 127);
			imagefill($this->scImageSig, 0, 0, $alpha);
			imagecopyresampled($this->scImageSig, $this->scImage, 0, 0, 0, $CropStartY, $imageSigX, $imageSigY, $this->scImgSize['x'], $CropHeight);
			imagepng($this->scImage, $name_String . $this->scID . $name_String2);
			imagepng($this->scImageSig, $name_String . $this->scID . $name_StringSig . $name_String2);
			imagedestroy($this->scImage);
			imagedestroy($this->scImageSig);
		//Debug
			//echo system('free');
	}

	private function arraytolower($array, $include_leys=false)
	{
		if($include_leys)
		{
			foreach($array as $key => $value){
			if(is_array($value))
			  $array2[strtolower($key)] = arraytolower($value, $include_leys);
			else
			  $array2[strtolower($key)] = strtolower($value);
			}
			$array = $array2;
		}
		else 
		{
			foreach($array as $key => $value) 
			{
			if(is_array($value)) $array[$key] = arraytolower($value, $include_leys);
			else $array[$key] = strtolower($value);  
			}
		}
		return $array;
	} 
	
	public function getIsOfficer($rank)
	{
		$rank = strtolower($rank);
		switch($rank)
		{
			case '2lt':
				return true;
			break;
			case '1lt':
				return true;
			break;
			case 'cpt':
				return true;
			break;
			case 'maj':
				return true;
			break;
			case 'lt col':
				return true;
			break;
			default:
			break;
		}
		return false;
	}

	public function getName()
	{
		$text = strtolower($this->scName);
		return $text;
	}
	public function getID()
	{
		return $this->scID;
	}
	public function update_servicecoatC($name=0, $id=0, $rank='pvt', $unit='29th', $awards=array())
	{
	    $this->prepare(); // used to be __construct() but does things that shouldn't be in construct
		$awards = $this->arraytolower($awards);
		$this->scName = $name;
		$this->scID = $id;
		$this->scRank = $rank;
		$this->scInsignia = $unit;
		if($awards != NULL)
		{
			foreach($awards as $awardarray => $award)
			{
				switch($award)
				{
					case (in_array($award, $this->scAllAQBadges)): array_push($this->scAQBadges, $award); break;
					case (in_array($award, $this->scAllARibbons)): array_push($this->scARibbons, $award); break;
					case (in_array($award, $this->scAllURibbons)): array_push($this->scURibbons, $award); break;
					case (in_array($award, $this->scAllTRBadges)): array_push($this->scTRBadges, $award); break;
					case (in_array($award, $this->scAllTLBadges)): array_push($this->scTLBadges, $award); break;
					case (in_array($award, $this->scAllBLBadges)): array_push($this->scBLBadges, $award); break;
					case (in_array($award, $this->scAllBRBadges)): array_push($this->scBRBadges, $award); break;
				}
			}
		}
		$this->compileJacket();
	}
}