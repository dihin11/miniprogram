App({
  globalData: {
    userInfo: null,
    apiBaseUrl: 'your-api-endpoint'
  },

  onLaunch() {
    this.checkUserAuth();
  },

  checkUserAuth() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
            }
          });
        }
      }
    });
  }
});