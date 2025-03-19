import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useState, useEffect } from 'react';

import DefaultLayout from '@/layouts/default';
import { title } from '@/components/primitives';

interface TaxInput {
  salary: string; // 税前工资
  specialDeduction: string; // 专项扣除
  childrenEdu: string; // 子女教育
  continuingEdu: string; // 继续教育
  housingLoan: string; // 住房贷款利息
  housingRent: string; // 住房租金
  elderlySupport: string; // 赡养老人
  otherDeduction: string; // 其他扣除
}

interface TaxResult {
  taxableIncome: number; // 应纳税所得额
  taxRate: number; // 税率
  quickDeduction: number; // 速算扣除数
  tax: number; // 应纳税额
  afterTaxIncome: number; // 税后收入
}

// 个税起征点
const TAX_THRESHOLD = 60000;

// 个税税率表
const TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, quickDeduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, quickDeduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, quickDeduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, quickDeduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, quickDeduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, quickDeduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, quickDeduction: 181920 },
];

export default function TaxCalculatorPage() {
  const [taxInput, setTaxInput] = useState<TaxInput>({
    salary: '',
    specialDeduction: '',
    childrenEdu: '',
    continuingEdu: '',
    housingLoan: '',
    housingRent: '',
    elderlySupport: '',
    otherDeduction: '',
  });

  const [taxResult, setTaxResult] = useState<TaxResult>({
    taxableIncome: 0,
    taxRate: 0,
    quickDeduction: 0,
    tax: 0,
    afterTaxIncome: 0,
  });

  // 从本地存储加载数据
  useEffect(() => {
    const savedTaxInput = localStorage.getItem('taxCalculatorInput');
    if (savedTaxInput) {
      setTaxInput(JSON.parse(savedTaxInput));
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (field: keyof TaxInput, value: string) => {
    const newTaxInput = {
      ...taxInput,
      [field]: value,
    };
    setTaxInput(newTaxInput);
    localStorage.setItem('taxCalculatorInput', JSON.stringify(newTaxInput));
  };

  // 计算个人所得税
  const calculateTax = () => {
    // 解析输入值，如果为空或非数字则默认为0
    const salary = parseFloat(taxInput.salary) || 0;
    const specialDeduction = parseFloat(taxInput.specialDeduction) || 0;
    const childrenEdu = parseFloat(taxInput.childrenEdu) || 0;
    const continuingEdu = parseFloat(taxInput.continuingEdu) || 0;
    const housingLoan = parseFloat(taxInput.housingLoan) || 0;
    const housingRent = parseFloat(taxInput.housingRent) || 0;
    const elderlySupport = parseFloat(taxInput.elderlySupport) || 0;
    const otherDeduction = parseFloat(taxInput.otherDeduction) || 0;

    // 计算专项附加扣除总额
    const totalSpecialAddDeduction =
      childrenEdu +
      continuingEdu +
      housingLoan +
      housingRent +
      elderlySupport +
      otherDeduction;

    // 计算应纳税所得额 = 工资收入 - 起征点 - 专项扣除 - 专项附加扣除
    const taxableIncome =
      salary - TAX_THRESHOLD - specialDeduction - totalSpecialAddDeduction;

    // 如果应纳税所得额小于等于0，则无需缴税
    if (taxableIncome <= 0) {
      setTaxResult({
        taxableIncome: 0,
        taxRate: 0,
        quickDeduction: 0,
        tax: 0,
        afterTaxIncome: salary,
      });
      return;
    }

    // 查找适用的税率和速算扣除数
    const bracket = TAX_BRACKETS.find(
      (bracket) => taxableIncome > bracket.min && taxableIncome <= bracket.max
    );

    if (!bracket) {
      return;
    }

    // 计算应纳税额 = 应纳税所得额 * 税率 - 速算扣除数
    const tax = taxableIncome * bracket.rate - bracket.quickDeduction;

    // 计算税后收入 = 工资收入 - 应纳税额
    const afterTaxIncome = salary - tax;

    // 更新计算结果
    setTaxResult({
      taxableIncome,
      taxRate: bracket.rate,
      quickDeduction: bracket.quickDeduction,
      tax,
      afterTaxIncome,
    });
  };

  // 重置表单
  const resetForm = () => {
    const emptyInput: TaxInput = {
      salary: '',
      specialDeduction: '',
      childrenEdu: '',
      continuingEdu: '',
      housingLoan: '',
      housingRent: '',
      elderlySupport: '',
      otherDeduction: '',
    };
    setTaxInput(emptyInput);
    setTaxResult({
      taxableIncome: 0,
      taxRate: 0,
      quickDeduction: 0,
      tax: 0,
      afterTaxIncome: 0,
    });
    localStorage.setItem('taxCalculatorInput', JSON.stringify(emptyInput));
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title({ color: 'violet' })}>个税计算器</h1>
        <p className="text-default-500 mt-4">计算个人所得税及税后收入</p>
        <Card className="max-w-4xl w-full">
          <CardHeader className="flex gap-3"></CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-default-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold md:col-span-2">基本信息</h3>
                <Input
                  type="number"
                  label="税前工资"
                  placeholder="请输入税前工资"
                  value={taxInput.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />

                <Input
                  type="number"
                  label="专项扣除"
                  placeholder="请输入专项扣除金额"
                  value={taxInput.specialDeduction}
                  onChange={(e) => handleInputChange('specialDeduction', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-default-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold md:col-span-2">专项附加扣除</h3>
                <Input
                  type="number"
                  label="子女教育"
                  placeholder="请输入子女教育扣除金额"
                  value={taxInput.childrenEdu}
                  onChange={(e) => handleInputChange('childrenEdu', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
                <Input
                  type="number"
                  label="继续教育"
                  placeholder="请输入继续教育扣除金额"
                  value={taxInput.continuingEdu}
                  onChange={(e) => handleInputChange('continuingEdu', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
                <Input
                  type="number"
                  label="住房贷款利息"
                  placeholder="请输入住房贷款利息扣除金额"
                  value={taxInput.housingLoan}
                  onChange={(e) => handleInputChange('housingLoan', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
                <Input
                  type="number"
                  label="住房租金"
                  placeholder="请输入住房租金扣除金额"
                  value={taxInput.housingRent}
                  onChange={(e) => handleInputChange('housingRent', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
                <Input
                  type="number"
                  label="赡养老人"
                  placeholder="请输入赡养老人扣除金额"
                  value={taxInput.elderlySupport}
                  onChange={(e) => handleInputChange('elderlySupport', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
                <Input
                  type="number"
                  label="其他扣除"
                  placeholder="请输入其他扣除金额"
                  value={taxInput.otherDeduction}
                  onChange={(e) => handleInputChange('otherDeduction', e.target.value)}
                  endContent={<div className="pointer-events-none">元</div>}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button color="default" onPress={resetForm}>
                  重置
                </Button>
                <Button color="primary" onPress={calculateTax}>
                  计算
                </Button>
              </div>

              <div className="mt-8 bg-default-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">计算结果</h3>
                <div className="space-y-3 bg-default-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>应纳税所得额：</span>
                    <span className="font-semibold">
                      {taxResult.taxableIncome.toFixed(2)} 元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>适用税率：</span>
                    <span className="font-semibold">
                      {(taxResult.taxRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>速算扣除数：</span>
                    <span className="font-semibold">
                      {taxResult.quickDeduction.toFixed(2)} 元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>应纳税额：</span>
                    <span className="font-semibold">
                      {taxResult.tax.toFixed(2)} 元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>税后收入：</span>
                    <span className="font-semibold text-success">
                      {taxResult.afterTaxIncome.toFixed(2)} 元
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}