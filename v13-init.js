const special=replaceSpecialPage();
setVersion();addNavigator();addBreadcrumb();
if(pageId==='home'&&!special)upgradeHome();
if(periodId)upgradePeriod();
if(pageId==='timeline')upgradeTimeline();
upgradeEvidence();upgradeFossilization();upgradePaleo();upgradeAtmosphere();upgradeCollection();upgradeHumanity();upgradeDirectory();upgradeSearch();accessibilityPolish();
