module.exports = {
  name: 'form',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/form',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
