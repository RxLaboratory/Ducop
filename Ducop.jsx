/*
    Ducop Duduf Comp Parameters
    (c) 2014 Nicolas Dufresne
    http://www.duduf.net
    
    Allows to change parameters of all selected comps, including precomps
    
	This file is part of Ducop.

    Ducop is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ducop is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Duik. If not, see <http://www.gnu.org/licenses/>.
	
    */

function ducop(obj)
{

//fonction qui applique les paramètres sur les comps
function applyCompParams()
{
    var comps = [];
	var oldDurations = [];
    
    if (selectedButton.value)
     {    
         var recursive = includePrecomps.value;
        //RECUP LES COMPS SELECTIONNEES
        //prendre les comps sélectionnées en tant que calques
		if (app.project.activeItem != null && app.project.activeItem instanceof CompItem)
		{
			comps.push(app.project.activeItem)
			var layers = [];
			//si récursif
			if (recursive) for (i = 1;i<=app.project.activeItem.layers.length;i++)
			{
				if (app.project.activeItem.layer(i).source instanceof CompItem) comps.push(layers[i].source);
			}
		}
		
		//prendre les comps sélectionnées dans le projet
		for (i=0;i<app.project.selection;i++)
		{
			if (app.project.selection[i] instanceof CompItem) comps.push(app.project.selection[i]);
		}    

        //SI RECURSIF, PRENDRE LES PRECOMPS
        if (recursive) 
        {
            var compsR = [];
            for (i in comps)
            {
                compsR = compsR.concat(getPreComps(comps[i]));
            }
            comps = comps.concat(compsR);
        }
    }
    else
    {
        for (i = 1;i<=app.project.items.length;i++)
        {
            if (app.project.item(i) instanceof CompItem) comps.push(app.project.item(i));
        }
    }

    //SI AU FINAL ON A RIEN, RIEN A FAIRE
    if (comps.length == 0) return;
	
    //ET ON APPIQUE LES PARAMS
    app.beginUndoGroup("Duduf Comp Params");
    for (var i in comps)
    {
        var c = comps[i];
        
        //TAILLE
        var nul = c.layers.addNull();
        if (widthButton.value && keepAspectRatio.value)
        {   
            c.height = parseInt((parseInt(width.text,10)*c.height/c.width),10);
            c.width = parseInt(width.text,10);
        }
        else if (heightButton.value && keepAspectRatio.value)
        {   
            c.width = parseInt((parseInt(height.text,10)*c.width/c.height),10);
            c.height = parseInt(height.text,10);
        }
        else
        {
             if (widthButton.value) c.width = parseInt(width.text,10);
             if (heightButton.value) c.height = parseInt(height.text,10);
        }
        //déplacer les layers, via un nul
        for (lay = 1;lay<=c.layers.length;lay++)
        {
            if (c.layer(lay).parent == null && c.layer(lay) != nul)
                {
                    var l = c.layer(lay);
                    var locked = l.locked;
                    if (l.locked) l.locked = false;
                    l.parent = nul;
                    l.locked = locked;
                }
        }
        nul.transform.position.setValue([c.width/2,c.height/2]);
        nul.remove();
        
        //PIXEL ASPECT
        if (pixelAspectButton.value)
        {
            if (pixelAspect.selection.index == 0) c.pixelAspect = 1;
            if (pixelAspect.selection.index == 1) c.pixelAspect = 0.91;
            if (pixelAspect.selection.index == 2) c.pixelAspect = 1.21;
            if (pixelAspect.selection.index == 3) c.pixelAspect = 1.09;
            if (pixelAspect.selection.index == 4) c.pixelAspect = 1.46;
            if (pixelAspect.selection.index == 5) c.pixelAspect = 4/3;
            if (pixelAspect.selection.index == 6) c.pixelAspect = 1.5;
            if (pixelAspect.selection.index == 7) c.pixelAspect = 2;
        }
    //FPS
    if (fpsButton.value) c.frameRate = parseFloat(fps.text.split(",").join("."));
    //DURATION
    if (durationButton.value)
	{
		oldDurations.push(c.duration);
		c.duration = parseInt(duration.text)*c.frameDuration;
	}
    //SHUTTER
    if (shutterAngleButton.value)
    {
        var sa = parseInt(shutterAngle.text);
        if (sa > 720) sa = 720;
        if (sa < 0) sa = 0;
        c.shutterAngle = sa;
    }
    //SHUTTER PHASE
    if (shutterPhaseButton.value)
    {
        var sp = parseInt(shutterPhase.text);
        if (sp > 360) sp = 360;
        if (sp < -360) sp = -360;
        c.shutterPhase = sp;
    }
        
    }
    
	//ADAPT LAYER DURATIONS
	if (adaptLayerDurations.value && durationButton.value)
	{
		for (var i in comps)
		{
			var comp = comps[i];
			for (var j = 1;j<=comp.layers.length;j++)
			{
				var layer = comp.layer(j);
				if (layer.outPoint >= oldDurations[i]) layer.outPoint = comp.duration;
			}
		}
	}
	
	app.endUndoGroup();
}

//fonction qui sélectionne les sous compos de manière récursive
function getPreComps(comp)
{
    //parcourir la comp pour trouver les precomps
    var precomps = [];
    for (i = 1;i<=comp.layers.length;i++)
    {
        if (comp.layer(i).source instanceof CompItem)
        {
            precomps.push(comp.layer(i).source);
            precomps = precomps.concat(getPreComps(comp.layer(i).source));
        }
    return precomps;
    }
}





    //===============================================
    //================= UI============================
    //===============================================
	{
    function addHGroup(conteneur){
	var groupe = conteneur.add("group");
	groupe.alignChildren = ["fill","fill"];
	groupe.orientation = "row";
	groupe.spacing = 1;
	groupe.margins = 0;
	return groupe;
    }
    function addVGroup(conteneur){
        var groupe = conteneur.add("group");
        groupe.alignChildren = ["fill","fill"];
        groupe.orientation = "column";
        groupe.spacing = 1;
        groupe.margins = 0;
        return groupe;
    }
            
        
        
    var fenetre = obj instanceof Panel ? obj : new Window("window","Ducopa",undefined,{resizeable:true});
    fenetre.alignChildren = ["fill", "top"];
    fenetre.spacing  = 1;
    fenetre.margins = 2;
    
    var getGroup = addHGroup(fenetre);
    getGroup.alignment = ["fill","top"];
    var compButton = getGroup.add("button",undefined,"Get from active item");    
    compButton.onClick = function ()
    {
        if (app.project.activeItem != null)
        {
             width.text = app.project.activeItem.width;
             height.text = app.project.activeItem.height;
             if (app.project.activeItem.pixelAspect == 1) pixelAspect.selection = 0;
            if (app.project.activeItem.pixelAspect == 0.91) pixelAspect.selection = 1;
            if (app.project.activeItem.pixelAspect == 1.21) pixelAspect.selection = 2;
            if (app.project.activeItem.pixelAspect == 1.09) pixelAspect.selection = 3;
            if (app.project.activeItem.pixelAspect == 1.46) pixelAspect.selection = 4;
            if (app.project.activeItem.pixelAspect == 4/3) pixelAspect.selection = 5;
            if (app.project.activeItem.pixelAspect == 1.5) pixelAspect.selection = 6;
            if (app.project.activeItem.pixelAspect == 2) pixelAspect.selection = 7;
            fps.text = app.project.activeItem.frameRate;
            duration.text = app.project.activeItem.duration/app.project.activeItem.frameDuration; 
            shutterAngle.text = app.project.activeItem.shutterAngle;
            shutterPhase.text = app.project.activeItem.shutterPhase;
            widthValues.enabled = true;
            widthButton.value = true;
            heightValues.enabled = true;
            heightButton.value = true;
            pixelAspectValues.enabled = true;
            pixelAspectButton.value = true;
            fpsValues.enabled = true;
            fpsButton.value = true;
            durationValues.enabled = true;
            durationButton.value = true;
            shutterAngleValues.enabled = true;
            shutterAngleButton.value = true;
            shutterPhaseValues.enabled = true;
            shutterPhaseButton.value = true;
        } 
    };

    var widthGroup = addHGroup(fenetre);
    widthGroup.alignChildren = ["fill","center"];
    var widthButton = widthGroup.add("checkbox",undefined,"Width");
    widthButton.size = [100,25];
    widthButton.value = false;
    var widthValues = addHGroup(widthGroup);
    var width = widthValues.add("edittext",undefined,"1920");
    width.size = [75,25];
	width.enabled = false;
    var widthCompButton = widthValues.add("button",undefined,"<");
    widthCompButton.size = [25,25];
    widthCompButton.helpTip = "Get from active comp";
    widthCompButton.onClick = function ()  { if (app.project.activeItem != null) width.text = app.project.activeItem.width; widthButton.value = true; width.enabled = true; };

    var heightGroup = addHGroup(fenetre);
    heightGroup.alignChildren = ["fill","center"];
    var heightButton = heightGroup.add("checkbox",undefined,"Height");
    heightButton.size = [100,25];
    heightButton.value = false;
    var heightValues = addHGroup(heightGroup);
    var height = heightValues.add("edittext",undefined,"1080");
	height.enabled = false;
    height.size = [75,25];
    var heightCompButton = heightValues.add("button",undefined,"<");
    heightCompButton.size = [25,25];
    heightCompButton.helpTip = "Get from active comp";
    heightCompButton.onClick = function ()  { if (app.project.activeItem != null) height.text = app.project.activeItem.height; heightButton.value = true; height.enabled = true; };
    
    var keepAspectGroup = addHGroup(fenetre);
    var keepAspectRatio = keepAspectGroup.add("checkbox",undefined,"Keep Aspect Ratio");
    keepAspectRatio.onClick = function () { if (keepAspectRatio.value && widthButton.value && heightButton.value) heightButton.value = false; heightValues.enabled = heightButton.value; widthValues.enabled = widthButton.value; };
    heightButton.onClick = function () { if (keepAspectRatio.value && widthButton.value && heightButton.value) widthButton.value = false; heightValues.enabled = heightButton.value; widthValues.enabled = widthButton.value; };
    widthButton.onClick = function () { if (keepAspectRatio.value && widthButton.value && heightButton.value) heightButton.value = false; heightValues.enabled = heightButton.value; widthValues.enabled = widthButton.value; };
    
    var pixelAspectGroup = addHGroup(fenetre);
    pixelAspectGroup.alignChildren = ["fill","center"];
    var pixelAspectButton = pixelAspectGroup.add("checkbox",undefined,"Pixel Aspect");
    pixelAspectButton.size = [100,25];
    pixelAspectButton.value = false;
    pixelAspectButton.onClick = function () { pixelAspectValues.enabled = pixelAspectButton.value; };
    var pixelAspectValues = addHGroup(pixelAspectGroup);
    var pixelAspect = pixelAspectValues.add("dropdownlist",undefined,["Square (1)","NTSC (0.91)","NTSC wide (1.21)","PAL (1.09)","PAL wide (1.46)","HDV/DVCPRO 720 (1.33)","DVCPRO 1080 (1.5)","Anamorphic (2)"]);
    pixelAspect.enabled = false;
	pixelAspect.size = [75,25];
    pixelAspect.selection = 0;
    var pixelAspectCompButton = pixelAspectValues.add("button",undefined,"<");
    pixelAspectCompButton.size = [25,25];
    pixelAspectCompButton.helpTip = "Get from active comp";
    pixelAspectCompButton.onClick = function ()  { if (app.project.activeItem != null)
        {
            if (app.project.activeItem.pixelAspect == 1) pixelAspect.selection = 0;
            if (app.project.activeItem.pixelAspect == 0.91) pixelAspect.selection = 1;
            if (app.project.activeItem.pixelAspect == 1.21) pixelAspect.selection = 2;
            if (app.project.activeItem.pixelAspect == 1.09) pixelAspect.selection = 3;
            if (app.project.activeItem.pixelAspect == 1.46) pixelAspect.selection = 4;
            if (app.project.activeItem.pixelAspect == 4/3) pixelAspect.selection = 5;
            if (app.project.activeItem.pixelAspect == 1.5) pixelAspect.selection = 6;
            if (app.project.activeItem.pixelAspect == 2) pixelAspect.selection = 7;
            }
			pixelAspectButton.value = true;
			pixelAspect.enabled = true; 
        };
    
    var fpsGroup = addHGroup(fenetre);
    fpsGroup.alignChildren = ["fill","center"];
    var fpsButton = fpsGroup.add("checkbox",undefined,"FPS");
    fpsButton.size = [100,25];
    fpsButton.value = false;
    fpsButton.onClick = function () { fpsValues.enabled = fpsButton.value; };
    var fpsValues = addHGroup(fpsGroup);
    var fps = fpsValues.add("edittext",undefined,"24");
    fps.size = [75,25];
    fps.selection = 0;
	fps.enabled = false;
    var fpsCompButton = fpsValues.add("button",undefined,"<");
    fpsCompButton.size = [25,25];
    fpsCompButton.helpTip = "Get from active comp";
    fpsCompButton.onClick = function ()  { if (app.project.activeItem != null) fps.text = app.project.activeItem.frameRate; fpsButton.value = true; fps.enabled = true; };
    
    var durationGroup = addHGroup(fenetre);
    durationGroup.alignChildren = ["fill","center"];
    var durationButton = durationGroup.add("checkbox",undefined,"Duration");
    durationButton.size = [100,25];
    durationButton.value = false;
    durationButton.onClick = function () { durationValues.enabled = durationButton.value; };
    var durationValues = addHGroup(durationGroup);
    var duration = durationValues.add("edittext",undefined,"100");
    duration.size = [75,25];
    duration.selection = 0;
	duration.enabled = false;
    var durationCompButton = durationValues.add("button",undefined,"<");
    durationCompButton.size = [25,25];
    durationCompButton.helpTip = "Get from active comp";
    durationCompButton.onClick = function ()  { if (app.project.activeItem != null) duration.text = app.project.activeItem.duration/app.project.activeItem.frameDuration; durationButton.value = true; duration.enabled = true; };
    
    var shutterAngleGroup = addHGroup(fenetre);
    shutterAngleGroup.alignChildren = ["fill","center"];
    var shutterAngleButton = shutterAngleGroup.add("checkbox",undefined,"Shutter Angle");
    shutterAngleButton.size = [100,25];
    shutterAngleButton.value = false;
    shutterAngleButton.onClick = function () { shutterAngleValues.enabled = shutterAngleButton.value; };
    var shutterAngleValues = addHGroup(shutterAngleGroup);
    var shutterAngle = shutterAngleValues.add("edittext",undefined,"180");
    shutterAngle.size = [75,25];
	shutterAngle.enabled = false;
    var shutterAngleCompButton = shutterAngleValues.add("button",undefined,"<");
    shutterAngleCompButton.size = [25,25];
    shutterAngleCompButton.helpTip = "Get from active comp";
    shutterAngleCompButton.onClick = function ()  { if (app.project.activeItem != null) shutterAngle.text = app.project.activeItem.shutterAngle; shutterAngleButton.value = true; shutterAngle.enabled = true; };
    
    var shutterPhaseGroup = addHGroup(fenetre);
    shutterPhaseGroup.alignChildren = ["fill","center"];
    var shutterPhaseButton = shutterPhaseGroup.add("checkbox",undefined,"Shutter Phase");
    shutterPhaseButton.size = [100,25];
    shutterPhaseButton.value = false;
    shutterPhaseButton.onClick = function () { shutterPhaseValues.enabled = shutterPhaseButton.value; };
    var shutterPhaseValues = addHGroup(shutterPhaseGroup);
    var shutterPhase = shutterPhaseValues.add("edittext",undefined,"-90");
    shutterPhase.size = [75,25];
	shutterPhase.enabled = false;
    var shutterPhaseCompButton = shutterPhaseValues.add("button",undefined,"<");
    shutterPhaseCompButton.size = [25,25];
    shutterPhaseCompButton.helpTip = "Get from active comp";
    shutterPhaseCompButton.onClick = function ()  { if (app.project.activeItem != null) shutterPhase.text = app.project.activeItem.shutterPhase; shutterPhaseButton.value = true; shutterPhase.enabled = true; };
    
    var applyGroup = addHGroup(fenetre);
    var compsGroup = addVGroup(applyGroup);
    var applyOKGroup = addVGroup(applyGroup);
    
    var selectedButton = compsGroup.add("radiobutton",undefined,"Selected Comps");
    var allButton = compsGroup.add("radiobutton",undefined,"All Comps");
    selectedButton.value = true;

    var includePrecomps = applyOKGroup.add("checkbox",undefined,"Include Precomps");
    selectedButton.onClick = function () { includePrecomps.enabled = selectedButton.value; };
    allButton.onClick = function () { includePrecomps.enabled = selectedButton.value; };
	var adaptLayerDurations = applyOKGroup.add("checkbox",undefined,"> Layers durations");
	adaptLayerDurations.value = true;
	
    var applyButton = fenetre.add("button",undefined,"Apply");
    applyButton.onClick = applyCompParams;
	applyButton.alignment = ["fill","fill"];
    
    var versionGroup = addHGroup(fenetre);
    versionGroup.alignment = ["fill","bottom"];
    var dudufURL = versionGroup.add("statictext",undefined,"www.duduf.net");
	dudufURL.alignment = ["left","bottom"];
    var version = versionGroup.add("statictext",undefined,"v1.2");
    version.alignment = ["right","bottom"];

    //================= AFFICHAGE DE L'UI ============
    fenetre.layout.layout(true);
    fenetre.layout.resize();
    fenetre.onResizing = fenetre.onResize = function () {fenetre.layout.resize()};
    if (fenetre != null ) if (fenetre instanceof Window) fenetre.show();
    }

}


ducop(this);