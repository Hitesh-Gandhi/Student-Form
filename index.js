var jpdbBaseURL = "https://api.login2explore.com:5577";
var connToken = "90931818|-31949300867112550|90963429";

var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var stuDBName = "Student";
var stuRelationName = "StuData";

setBaseUrl(jpdbBaseURL);

function disableCtrl(ctrl) {
    $('#new').prop('disabled', ctrl);
    $('#save').prop('disabled', ctrl);
    $('#edit').prop('disabled', ctrl);
    $('#change').prop('disabled', ctrl);
    $('#reset').prop('disabled', ctrl);
}

function disableNav(ctrl) {
    $('#first').prop('disabled', ctrl);
    $('#prev').prop('disabled', ctrl);
    $('#next').prop('disabled', ctrl);
    $('#last').prop('disabled', ctrl);
}

function disableForm(bValue) {
    $('#stuid').prop('disabled', bValue);
    $('#stuname').prop('disabled', bValue);
    $('#stuclass').prop('disabled', bValue);
    $('#studob').prop('disabled', bValue);
    $('#stuaddress').prop('disabled', bValue);
    $('#studate').prop('disabled', bValue);
}

function initStuForm() {
    localStorage.removeItem("first_rec_no");
    localStorage.removeItem("last_rec_no");
    localStorage.removeItem("rec_no");

    console.log("initStuForm() - done");
}

function newForm() {
    makeDataFormEmpty();

    disableForm(false);
    $('#stuid').focus();
    disableNav(true);
    disableCtrl(true);

    $('#save').prop("disabled", false);
    $('#reset').prop("disabled", false);
}

function saveData() {
    var jsonStrObj = validateData();
    if (jsonStrObj === "") {
        return "";
    }
    var putRequest = createPUTRequest(connToken, jsonStrObj, stuDBName, stuRelationName);
    jQuery.ajaxSetup({ async: false });
    var jsonObj = executeCommand(putRequest, imlPartUrl);
    jQuery.ajaxSetup({ async: true });
    if (isNoRecordPresentLS()) {
        setFirstRecNo2LS(jsonObj);
    }
    setLastRecNo2LS(jsonObj);
    setCurrRecNo2LS(jsonObj);
    resetForm();
}

function editData() {
    disableForm(false);
    $("#stuid").prop("disabled", true);
    $("#stuname").focus();
    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function changeData() {
    jsonChg = validateData();
    var updateRequest = createUPDATERecordRequest(connToken, jsonChg, stuDBName, stuRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({ async: false });
    var jsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    console.log(jsonObj);
    resetForm();
    $("#stuid").focus();
    $("#edit").focus();
}

function resetForm() {
    disableCtrl(true);
    disableNav(false);

    var getCurrRequest = createGET_BY_RECORDRequest(connToken, stuDBName, stuRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getCurrRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({ async: true });

    if (isOnlyOneRecordPresent() || isNoRecordPresentLS()) {
        disableNav(true);
    }

    $("#new").prop("disabled", false);
    if (isNoRecordPresentLS()) {
        makeDataFormEmpty();
        $("#edit").prop("disabled", true);
    } else {
        $("#edit").prop("disabled", false);
    }
    disableForm(true);
}

function makeDataFormEmpty() {
    $('#stuid').val("");
    $('#stuname').val("");
    $('#stuclass').val("");
    $('#studob').val("");
    $('#stuclass').val("");
    $('#studob').val("");
    $('#stuaddress').val("");
    $('#studate').val("");
}

function validateData() {
    var stuid, stuname, stuclass, studob, stuaddress, studate;
    stuid = $("#stuid").val();
    stuname = $("#stuname").val();
    stuclass = $("#stuclass").val();
    studob = $("#studob").val();
    stuaddress = $("#stuaddress").val();
    studate = $("#studate").val();

    if (stuid === "") {
        alert("Roll No Missing");
        $("#stuid").focus();
        return "";
    }
    if (stuname === "") {
        alert("Name Missing");
        $("#stuname").focus();
        return "";
    }
    if (stuclass === "") {
        alert("Class Missing");
        $("#stuclass").focus();
        return "";
    }
    if (studob === "") {
        alert("Date of Birth Missing");
        $("#studob").focus();
        return "";
    }
    if (stuaddress === "") {
        alert("Address Missing");
        $("#stuaddress").focus();
        return "";
    }
    if (studate === "") {
        alert("Date of Joining Missing");
        $("#studate").focus();
        return "";
    }

    var jsonStrObj = {
        id: stuid,
        name: stuname,
        class: stuclass,
        dob: studob,
        address: stuaddress,
        date: studate
    };
    return JSON.stringify(jsonStrObj);
}

function isNoRecordPresentLS() {
    if (getFirstRecNoFromLS() === "0" && getLastRecNoFromLS() === "0") {
        return true;
    }
    return false;
}

function setFirstRecNo2LS() {
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined) {
        localStorage.setItem("first_rec_no", "0");
    } else {
        localStorage.setItem("first_rec_no", data.rec_no);
    }
}

function setLastRecNo2LS() {
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined) {
        localStorage.setItem("last_rec_no", "0");
    } else {
        localStorage.setItem("last_rec_no", data.rec_no);
    }
}

function setCurrRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem("rec_no", data.rec_no);
}

function getCurrRecNoFromLS() {
    return localStorage.getItem("rec_no");
}

function isOnlyOneRecordPresent() {
    if (isNoRecordPresentLS()) {
        return false;
    }
    if (getFirstRecNoFromLS() === getLastRecNoFromLS()) {
        return true;
    }
    return false;
}

function getFirst() {
    var getFirstRequest = createFIRST_RECORDRequet(connToken, stuDBName, stuRelationName);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand({ getFirstRequest, irlPartUrl });
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({ async: true });
    $('#stuid').prop("disabled", true);
    $('#first').prop("disabled", true);
    $('#prev').prop("disabled", true);
    $('#next').prop("disabled", false);
    $('#save').prop("disabled", true);
}

function getPrev() {
    var r = getCurrRecNoFromLS();
    if (r === 1) {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
    }
    var getPrevRequest = createPREV_RECORDRequest(connToken, stuDBName, stuRelationName, r);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getPrevRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({ async: true });
    var r = getCurrRecNoFromLS();
    if (r === 1) {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    }
    $("#save").prop("disabled", true);
}

function getNext() {
    var r = getCurrRecNoFromLS();

    var getPrevRequest = createNEXT_RECORDRequest(connToken, stuDBName, stuRelationName, r);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getPrevRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({ async: true });

    $("#save").prop("disabled", true);
}

function getLast() {
    var getLastRequest = createLAST_RECORDRequet(connToken, stuDBName, stuRelationName);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand({ getLastRequest, irlPartUrl });
    setLastRecNo2LS(result);
    showData(result);
    jQuery.ajaxSetup({ async: true });
    $('#stuid').prop("disabled", true);
    $('#first').prop("disabled", true);
    $('#prev').prop("disabled", true);
    $('#next').prop("disabled", false);
    $('#save').prop("disabled", true);
}

function showData(jsonObj) {
    if (jsonObj.status === 400) {
        return;
    }
    var data = (JSON.parse(jsonObj.data)).record;
    setCurrRecNo2LS(jsonObj);
    $('#stuid').val(data.id);
    $('#stuname').val(data.name);
    $('#stuclass').val(data.class);
    $('#studob').val(data.dob);
    $('#stuaddress').val(data.address);
    $('#studate').val(data.date);

    disableNav(false);
    disableForm(true);

    $('#save').prop("disabled", true);
    $('#change').prop("disabled", true);
    $('#reset').prop("disabled", true);

    $('#new').prop("disabled", false);
    $('#edit').prop("disabled", false);

    if (getCurrRecNoFromLS() === getLastRecNoFromLS()) {
        $('#next').prop("disabled", true);
        $('#last').prop("disabled", true);
    }
    if (getCurrRecNoFromLS() === getFirstRecNoFromLS()) {
        $('#prev').prop("disabled", true);
        $('#first').prop("disabled", true);
        return;
    }
}


function getFirstRecNoFromLS() {
    return localStorage.getItem("first_rec_no");
}

function getLastRecNoFromLS() {
    return localStorage.getItem("last_item_no");
}


function checkForNoOrOneRecord() {
    if (isNoRecordPresentLS()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $('#new').prop("disabled", false);
    }
    if (isOnlyOneRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $('#new').prop("disabled", false);
        $('#edit').prop("disabled", false);
        return;
    }
}

initStuForm();
getFirst();
getLast();
checkForNoOrOneRecord();