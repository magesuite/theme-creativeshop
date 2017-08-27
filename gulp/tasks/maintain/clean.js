import del from 'del';
import settings from '../../config/maintain/clean';

module.exports = function() {
  return del(settings.src, {
    force: true,
  });
};
