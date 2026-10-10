import React, { useState } from 'react';
import { SKIN_DEFINITIONS } from '../../data/skins/skins.js';
import { ApiClient } from '../services/api-client.js';
import { DinoAvatar } from '../skins/DinoAvatar.jsx';
import { GroundStage } from '../ui/GroundStage.jsx';
import { soundFX } from '../utils/sound.js';

/**
 * Màn hình chào & Đăng nhập người chơi — Tuân thủ nghiêm ngặt yêu cầu Mục 5:
 * - Chỉ có đúng 2 trường bắt buộc: Họ và tên + Lớp.
 * - Tuyệt đối không có trường ID tài khoản hay OTP.
 */
export function LoginScreen({ onLoginSuccess }) {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundFX.playClick();

    const result = await ApiClient.login(fullName, className);
    if (!result.success || !result.profile) {
      setErrors(
        result.errors || {
          fullName: 'Vui lòng kiểm tra lại họ tên và lớp.',
        }
      );
      soundFX.playWrong();
      return;
    }

    setErrors({});
    soundFX.playCorrect();
    onLoginSuccess(result.profile);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <h1 className="text-center font-pixel text-[58px] font-extrabold leading-[0.95] text-ink">
        English Game
        <br />
        Dinosaur
      </h1>
      <p className="mt-3 text-center text-[15px] text-muted">Ôn Tiếng Anh 10 Global Success</p>

      <GroundStage cactus className="mt-7">
        <DinoAvatar skin={SKIN_DEFINITIONS[0]} size={96} animated />
      </GroundStage>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-6">
        <div>
          <label
            htmlFor="player-full-name"
            className="mb-2.5 block text-[15px] font-semibold text-text"
          >
            Họ và tên
          </label>
          <input
            id="player-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn An"
            value={fullName}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'player-full-name-error' : undefined}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            className="pixel-input"
          />
          {errors.fullName && (
            <p
              id="player-full-name-error"
              role="alert"
              className="mt-2.5 text-[14px] font-medium text-berry-deep"
            >
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="player-class-name"
            className="mb-2.5 block text-[15px] font-semibold text-text"
          >
            Lớp
          </label>
          <input
            id="player-class-name"
            name="className"
            type="text"
            autoCapitalize="characters"
            placeholder="10A1"
            value={className}
            aria-invalid={Boolean(errors.className)}
            aria-describedby={errors.className ? 'player-class-name-error' : undefined}
            onChange={(e) => {
              setClassName(e.target.value);
              if (errors.className) {
                setErrors((prev) => ({ ...prev, className: undefined }));
              }
            }}
            className="pixel-input"
          />
          {errors.className && (
            <p
              id="player-class-name-error"
              role="alert"
              className="mt-2.5 text-[14px] font-medium text-berry-deep"
            >
              {errors.className}
            </p>
          )}
        </div>

        <button type="submit" className="pixel-btn mt-2 min-h-16 w-full text-[34px]">
          Vào chơi
        </button>
      </form>

      <p className="mt-auto pt-8 text-center text-[13px] text-muted">
        Họ tên và lớp dùng để lưu điểm và ghi tên lên bảng xếp hạng.
      </p>
    </div>
  );
}
