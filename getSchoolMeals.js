const UNHO_ATPT_OFCDC_SC_CODE = "M10";
const UNHO_SD_SCHUL_CODE = "8000091";

async function getSchoolCode(schoolName) {
    let req = await fetch(
        `https://open.neis.go.kr/hub/schoolInfo?KEY=${
            process.env.OPENAPI_KEY
        }&Type=json&SCHUL_NM=${encodeURIComponent(schoolName)}`
    );
    let data = await req.json();

    try {
        return data.schoolInfo[1].row;
    } catch {
        return [];
    }
}

class SchoolMealFetchError extends Error {
    constructor(message) {
        super(message);
        this.name = "SchoolMealFetchError";
    }
}

async function getSchoolMeals(schoolName, date = new Date()) {
    let LOC_CODE, SCHOOL_CODE;
    if (!!!schoolName) {
        LOC_CODE = UNHO_ATPT_OFCDC_SC_CODE;
        SCHOOL_CODE = UNHO_SD_SCHUL_CODE;
    } else {
        let schoolSearch = await getSchoolCode(schoolName);
        if (schoolSearch.length == 0)
            throw new SchoolMealFetchError(
                "학교 정보를 불러올수 없습니다. 학교명을 확인해주세요.\n" +
                    "(예시: 청주공고, 충북공고의 경우 '청주공업고', '충북공업고'와 같이 입력해야함)"
            );
        LOC_CODE = schoolSearch[0]["ATPT_OFCDC_SC_CODE"];
        SCHOOL_CODE = schoolSearch[0]["SD_SCHUL_CODE"];
    }

    let yyyymmdd = `${date.getFullYear()}${
        (date.getMonth() + 1).toString().length == 1
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1
    }${
        date.getDate().toString().length == 1
            ? "0" + date.getDate()
            : date.getDate()
    }`;
    let req = await fetch(
        `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${process.env.OPENAPI_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${LOC_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${yyyymmdd}`
    );

    let res = await req.json();
    if (!!!res.mealServiceDietInfo)
        throw new SchoolMealFetchError("급식이 존재하지 않습니다.");

    let data = res["mealServiceDietInfo"][1]["row"];

    result = [];
    data.forEach((e) => {
        result.push({
            meal_number: e["MMEAL_SC_CODE"],
            content:
                e["DDISH_NM"].split("<br/>").join("\n") +
                "\n\n" +
                "칼로리: " +
                e["CAL_INFO"] +
                "\n\n" +
                "[영양정보]\n" +
                e["NTR_INFO"].split("<br/>").join("\n"),
        });
    });
    return result;
}

module.exports = {
    getSchoolMeals,
    SchoolMealFetchError,
};
