const { FORTUNE_TYPES } = require('../../utils/constants');
const { formatDate } = require('../../utils/date');

Page({
  data: {
    type: '',
    resultTitle: '',
    currentDate: '',
    fortuneResult: '',
    matchScore: 0
  },

  onLoad(options) {
    const { type, result } = options;
    const fortuneType = Object.values(FORTUNE_TYPES).find(t => t.key === type);
    const fortuneResult = JSON.parse(decodeURIComponent(result));
    
    this.setData({
      type,
      resultTitle: fortuneType.resultTitle,
      currentDate: formatDate(),
      fortuneResult: fortuneResult.fortune,
      matchScore: fortuneResult.score || 0
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 2
    });
  },

  onShareAppMessage() {
    return {
      title: '快来测测你的运势吧！',
      path: '/pages/index/index'
    };
  }
});