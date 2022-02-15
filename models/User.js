var mongoose = require("mongoose");

// schema
var userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      select: false, //select: false를 입력하면 이 모델을 불러올 때, 이 항목은 빼고 불러온다
    },
    name: { type: String, required: [true, "Name is required!"] },
    email: { type: String },
  },
  {
    toObject: { virtuals: true }, //virual 사용을 위해
  }
);

// virtuals
//회원가입, 회원정보 수정 등에 필요한 항목이나, DB에 저장 될 필요가 없다.
//.virrual("항목명")

userSchema
  .virtual("passwordConfirmation")
  .get(function () {
    return this._passwordConfirmation;
  })
  .set(function (value) {
    this._passwordConfirmation = value;
  });

userSchema
  .virtual("originalPassword")
  .get(function () {
    return this._originalPassword;
  })
  .set(function (value) {
    this._originalPassword = value;
  });

userSchema
  .virtual("currentPassword")
  .get(function () {
    return this._currentPassword;
  })
  .set(function (value) {
    this._currentPassword = value;
  });

userSchema
  .virtual("newPassword")
  .get(function () {
    return this._newPassword;
  })
  .set(function (value) {
    this._newPassword = value;
  });

// password validation - password를 DB에 Create혹은Update하기 전 값이 유효한지 확인
userSchema.path("password").validate(function (v) {
  var user = this; //this : usermodel

  // create user
  //password confirmation값이 '없는' 경우와, password값이
  //password confirmation값과 '다른' 경우에 '유효하지않음'처리(invalidate)
  if (user.isNew) {
    if (!user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation is required."
      );
    }

    if (user.password !== user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation does not matched!"
      );
    }
  }

  // update user
  //current password값이 없는 경우와, current password값이
  //original password값과 다른 경우, new password값과 password confirmation값이
  //다른 경우 invalidate--> 항상 수정하진 않으니, new password와
  //password confirmation값이 없어도 에러는 아니다.
  if (!user.isNew) {
    if (!user.currentPassword) {
      user.invalidate("currentPassword", "Current Password is required!");
    } else if (user.currentPassword != user.originalPassword) {
      user.invalidate("currentPassword", "Current Password is invalid!");
    }

    if (user.newPassword !== user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation does not matched!"
      );
    }
  }
});

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
