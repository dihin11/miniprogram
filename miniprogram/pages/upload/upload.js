const { FORTUNE_TYPES } = require('../../utils/constants');
const { getFortuneTelling } = require('../../utils/api');

Page({
  data: {
    type: '',
    images: [],
    needTwoPhotos: false,
    uploadTitle: '',
    uploadSubtitle: '',
    canSubmit: false
  },

  onLoad(options) {
    const type = options.type;
    const fortuneType = Object.values(FORTUNE_TYPES).find(t => t.key === type);
    const needTwoPhotos = type === 'friendship' || type === 'love';
    
    this.setData({
      type,
      needTwoPhotos,
      uploadTitle: fortuneType.title,
      uploadSubtitle: fortuneType.subtitle,
      images: []
    });
  },

  chooseImage(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = [...this.data.images];
        images[index] = res.tempFilePaths[0];
        
        const canSubmit = this.data.needTwoPhotos ? 
          images[0] && images[1] : 
          images[0];
        
        this.setData({
          images,
          canSubmit
        });
      }
    });
  },

  async submitPhotos() {
    wx.showLoading({
      title: '正在分析...',
    });

    try {
      const result = await getFortuneTelling(this.data.type, this.data.images);
      wx.hideLoading();
      
      wx.navigateTo({
        url: `/pages/result/result?type=${this.data.type}&result=${encodeURIComponent(JSON.stringify(result))}`
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
    }
  }
});