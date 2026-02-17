'use client';

import { cn } from '@/lib/utils';
import { calculatePasswordEntropy, generatePassword } from '@systemix/password';
import {
  AlertCircle,
  Check,
  Copy,
  Info,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

export default function PasswordPage() {
  const [options, setOptions] = useState({
    length: 16,
    useNumbers: true,
    useUppercase: true,
    useLowercase: true,
    useSymbols: true,
    minNumbers: 2,
    minUppercase: 2,
    minLowercase: 2,
    minSymbols: 2,
    excludeSimilarCharacters: false,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);

  const getCharsetSize = useCallback(() => {
    let size = 0;
    if (options.useLowercase) size += 26;
    if (options.useUppercase) size += 26;
    if (options.useNumbers) size += 10;
    if (options.useSymbols) size += 32; // Standard special chars
    return size;
  }, [options]);

  const handleGenerate = useCallback(() => {
    try {
      const pass = generatePassword(options) as string;
      setPassword(pass);
      setEntropy(calculatePasswordEntropy(options.length, getCharsetSize()));
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
    }
  }, [options, getCharsetSize]);

  useEffect(() => {
    void handleGenerate();
  }, [handleGenerate]);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStrengthLabel = (entropy: number) => {
    if (entropy < 40)
      return { label: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500' };
    if (entropy < 60)
      return { label: 'Weak', color: 'text-orange-500', bg: 'bg-orange-500' };
    if (entropy < 80)
      return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (entropy < 100)
      return {
        label: 'Strong',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500',
      };
    return {
      label: 'Very Strong',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400',
    };
  };

  const strength = getStrengthLabel(entropy);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Password Generator
          </h1>
          <p className="text-muted-foreground">
            Generate cryptographically secure passwords with custom constraints.
          </p>
        </div>

        {/* Password Display */}
        <div className="glass rounded-2xl p-8 relative group overflow-hidden border border-white/10">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
            <motion.div
              className={cn('h-full transition-all duration-500', strength.bg)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(entropy, 128) / 1.28}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
            <div className="text-2xl sm:text-3xl font-mono font-medium text-white break-all tracking-wider selection:bg-blue-500/30">
              {password}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all active:scale-95"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 items-center border-t border-white/5 pt-6">
            <div className="flex items-center gap-2">
              <Shield className={cn('w-4 h-4', strength.color)} />
              <span className="text-sm font-medium text-white">
                {strength.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>
                Entropy:{' '}
                <span className="text-white font-mono">
                  {entropy.toFixed(1)}
                </span>{' '}
                bits
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-semibold text-white">Configuration</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Length
                  </label>
                  <span className="text-sm font-mono text-blue-400">
                    {options.length}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="100"
                  value={options.length}
                  onChange={(e) =>
                    setOptions({ ...options, length: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Checkbox
                  label="Numbers (0-9)"
                  checked={options.useNumbers}
                  onChange={(checked) =>
                    setOptions({ ...options, useNumbers: checked })
                  }
                />
                <Checkbox
                  label="Uppercase (A-Z)"
                  checked={options.useUppercase}
                  onChange={(checked) =>
                    setOptions({ ...options, useUppercase: checked })
                  }
                />
                <Checkbox
                  label="Lowercase (a-z)"
                  checked={options.useLowercase}
                  onChange={(checked) =>
                    setOptions({ ...options, useLowercase: checked })
                  }
                />
                <Checkbox
                  label="Symbols (@#$!)"
                  checked={options.useSymbols}
                  onChange={(checked) =>
                    setOptions({ ...options, useSymbols: checked })
                  }
                />
                <Checkbox
                  label="Exclude Similar"
                  checked={options.excludeSimilarCharacters}
                  onChange={(checked) =>
                    setOptions({
                      ...options,
                      excludeSimilarCharacters: checked,
                    })
                  }
                  tooltip="Excludes visually similar characters like 1, l, I, 0, O"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Character Guarantees
              </h3>
              <div className="group relative">
                <AlertCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded bg-gray-800 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Ensures at least this many characters of the specified type
                  are included in the result.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <NumberInput
                label="Min Numbers"
                value={options.minNumbers}
                onChange={(val) => setOptions({ ...options, minNumbers: val })}
                disabled={!options.useNumbers}
              />
              <NumberInput
                label="Min Uppercase"
                value={options.minUppercase}
                onChange={(val) =>
                  setOptions({ ...options, minUppercase: val })
                }
                disabled={!options.useUppercase}
              />
              <NumberInput
                label="Min Lowercase"
                value={options.minLowercase}
                onChange={(val) =>
                  setOptions({ ...options, minLowercase: val })
                }
                disabled={!options.useLowercase}
              />
              <NumberInput
                label="Min Symbols"
                value={options.minSymbols}
                onChange={(val) => setOptions({ ...options, minSymbols: val })}
                disabled={!options.useSymbols}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  tooltip: _tooltip,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  tooltip?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={cn(
            'w-5 h-5 rounded border border-white/20 transition-all group-hover:border-blue-500/50',
            checked ? 'bg-blue-600 border-blue-600' : 'bg-white/5',
          )}
        >
          {checked && <Check className="w-full h-full text-white p-0.5" />}
        </div>
      </div>
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex items-center gap-1">
        {label}
      </span>
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        disabled && 'opacity-40 pointer-events-none',
      )}
    >
      <label className="text-sm text-gray-400">{label}</label>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-mono text-white">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
