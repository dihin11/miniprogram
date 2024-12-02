Page({
  data: {
    userInfo: null,
    fortuneTypes: [
      {
        key: 'self',
        title: '测自己',
        subtitle: '解析你的性格特质与运势',
        image: '/images/self.png'
      },
      {
        key: 'friendship',
        title: '测友情',
        subtitle: '分析两个人的友谊深度',
        image: '/images/friendship.png'
      },
      {
        key: 'love',
        title: '测姻缘',
        subtitle: '探索两人的缘分指数',
        image: '/images/love.png'
      }
    ]
  },

  goToUpload(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/upload/upload?type=${type}`
    });
  },

  onLoad() {
    // Check if user is logged in
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.setData({
                userInfo: res.userInfo
              });
            }
          });
        }
      }
    });
  }
});