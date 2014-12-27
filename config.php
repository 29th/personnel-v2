<?php if (!defined('APPLICATION')) exit();

// Conversations
$Configuration['Conversations']['Version'] = '2.2.16.1';

// Database
$Configuration['Database']['Name'] = getenv('DB_FORUMS_DATABASE');
$Configuration['Database']['Host'] = getenv('DB_FORUMS_HOSTNAME');
$Configuration['Database']['User'] = getenv('DB_FORUMS_USERNAME');
$Configuration['Database']['Password'] = getenv('DB_FORUMS_PASSWORD');
$Configuration['Debug'] = getenv('ENVIRONMENT') == 'development' ? true : false;

// EnabledApplications
$Configuration['EnabledApplications']['Conversations'] = 'conversations';
$Configuration['EnabledApplications']['Vanilla'] = 'vanilla';

// EnabledPlugins
$Configuration['EnabledPlugins']['HtmLawed'] = 'HtmLawed';
$Configuration['EnabledPlugins']['steamprofile'] = TRUE;
$Configuration['EnabledPlugins']['MentionsPlus'] = TRUE;
$Configuration['EnabledPlugins']['EasyMembersList'] = TRUE;
$Configuration['EnabledPlugins']['AddMenuitem'] = TRUE;
$Configuration['EnabledPlugins']['29th-rank'] = TRUE;

// Garden
$Configuration['Garden']['Title'] = '29th Infantry Division';
$Configuration['Garden']['Cookie']['Salt'] = getenv('VANILLA_COOKIE_SALT');
$Configuration['Garden']['Cookie']['Domain'] = getenv('VANILLA_COOKIE_DOMAIN');
$Configuration['Garden']['Registration']['ConfirmEmail'] = '1';
$Configuration['Garden']['Registration']['Method'] = 'Captcha';
$Configuration['Garden']['Registration']['ConfirmEmailRole'] = '3';
$Configuration['Garden']['Registration']['CaptchaPrivateKey'] = getenv('CAPTCHA_PRIVATE_KEY');
$Configuration['Garden']['Registration']['CaptchaPublicKey'] = getenv('CAPTCHA_PUBLIC_KEY');
$Configuration['Garden']['Registration']['InviteExpiration'] = '1 week';
$Configuration['Garden']['Registration']['InviteRoles']['3'] = '0';
$Configuration['Garden']['Registration']['InviteRoles']['4'] = '0';
$Configuration['Garden']['Registration']['InviteRoles']['8'] = '0';
$Configuration['Garden']['Registration']['InviteRoles']['16'] = '0';
$Configuration['Garden']['Registration']['InviteRoles']['32'] = '0';
$Configuration['Garden']['Registration']['InviteRoles']['33'] = '0';
$Configuration['Garden']['Email']['SupportName'] = '29th';
$Configuration['Garden']['InputFormatter'] = 'Html';
$Configuration['Garden']['Version'] = '2.2.16.1';
$Configuration['Garden']['RewriteUrls'] = TRUE;
$Configuration['Garden']['CanProcessImages'] = TRUE;
$Configuration['Garden']['SystemUserID'] = getenv('SYSTEM_USER_ID');
$Configuration['Garden']['Installed'] = FALSE;
$Configuration['Garden']['Theme'] = 'bootstrap';
$Configuration['Garden']['ThemeOptions']['Name'] = 'Bootstrap';
$Configuration['Garden']['ThemeOptions']['Styles']['Key'] = 'Default';
$Configuration['Garden']['ThemeOptions']['Styles']['Value'] = '%s_default';
$Configuration['Garden']['HomepageTitle'] = '29th Infantry Division';
$Configuration['Garden']['Description'] = '';
$Configuration['Garden']['FavIcon'] = 'favicon_fc89c1044d485bb6.ico';
$Configuration['Garden']['Embed']['Allow'] = TRUE;
$Configuration['Garden']['Embed']['RemoteUrl'] = '';
$Configuration['Garden']['Embed']['ForceDashboard'] = FALSE;
$Configuration['Garden']['Embed']['ForceForum'] = FALSE;
$Configuration['Garden']['TrustedDomains'] = array('personnel.29th.org');
$Configuration['Garden']['SignIn']['Popup'] = '1';
$Configuration['Garden']['User']['ValidationRegex'] = '\\d\\w_ äöüß';
$Configuration['Garden']['User']['ValidationLength'] = '{3,20}';
$Configuration['Garden']['EditContentTimeout'] = '-1';

// Plugins
$Configuration['Plugins']['GettingStarted']['Dashboard'] = '1';
$Configuration['Plugins']['GettingStarted']['Registration'] = '1';
$Configuration['Plugins']['GettingStarted']['Categories'] = '1';
$Configuration['Plugins']['GettingStarted']['Plugins'] = '1';
$Configuration['Plugins']['GettingStarted']['Discussion'] = '1';
$Configuration['Plugins']['GettingStarted']['Profile'] = '1';
$Configuration['Plugins']['MentionsPlus']['MentionStart'] = '"';
$Configuration['Plugins']['MentionsPlus']['MentionStop'] = '"';
$Configuration['Plugins']['MentionsPlus']['MeActionCode'] = '/me';
$Configuration['Plugins']['EasyMembersList']['ShowLinkInMenu'] = '1';
$Configuration['Plugins']['EasyMembersList']['ShowLinkInFlyout'] = '1';
$Configuration['Plugins']['EasyMembersList']['ShowToGuests'] = '';
$Configuration['Plugins']['EasyMembersList']['ShowEmail'] = '';
$Configuration['Plugins']['EasyMembersList']['ShowOnlyToTheseUsers'] = '';
$Configuration['Plugins']['EasyMembersList']['HideTheseUsers'] = '';
$Configuration['Plugins']['AddMenuitem']['Name1'] = '';
$Configuration['Plugins']['AddMenuitem']['Link1'] = '';
$Configuration['Plugins']['AddMenuitem']['Name2'] = '';
$Configuration['Plugins']['AddMenuitem']['Link2'] = '';
$Configuration['Plugins']['AddMenuitem']['Name3'] = '';
$Configuration['Plugins']['AddMenuitem']['Link3'] = '';
$Configuration['Plugins']['AddMenuitem']['Name4'] = 'Personnel';
$Configuration['Plugins']['AddMenuitem']['Link4'] = 'http://personnel.29th.org';
$Configuration['Plugins']['AddMenuitem']['Name5'] = '';
$Configuration['Plugins']['AddMenuitem']['Link5'] = '';

// Routes
$Configuration['Routes']['DefaultController'] = array('categories', 'Internal');
$Configuration['Routes']['bWVtYmVycw=='] = array('/plugin/EasyMembersList', 'Internal');

// Vanilla
$Configuration['Vanilla']['Version'] = '2.2.16.1';
$Configuration['Vanilla']['Discussions']['Layout'] = 'table';
$Configuration['Vanilla']['Discussions']['PerPage'] = '30';
$Configuration['Vanilla']['Categories']['Layout'] = 'table';
$Configuration['Vanilla']['Categories']['MaxDisplayDepth'] = '3';
$Configuration['Vanilla']['Categories']['DoHeadings'] = '1';
$Configuration['Vanilla']['Categories']['HideModule'] = '1';
$Configuration['Vanilla']['Comments']['AutoRefresh'] = NULL;
$Configuration['Vanilla']['Comments']['PerPage'] = '30';
$Configuration['Vanilla']['Archive']['Date'] = '';
$Configuration['Vanilla']['Archive']['Exclude'] = FALSE;
$Configuration['Vanilla']['AdminCheckboxes']['Use'] = FALSE;

// Last edited by Wheatley (97.89.26.73)2014-11-23 18:18:48