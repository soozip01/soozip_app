import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock Supabase client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();

const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("stylingPackage.getBySubmissionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no packages found", async () => {
    // Mock chain: from -> select -> eq -> order
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stylingPackage.getBySubmissionId({
      surveyId: "nonexistent-id",
    });

    expect(result).toEqual([]);
  });

  it("returns packages with items when data exists", async () => {
    const mockPackages = [
      {
        id: "pkg-1",
        survey_id: "survey-123",
        survey_name: "테스트 사용자",
        package_name: "거실 패키지",
        styling_type: "furniture",
        designer_name: "김디자이너",
        memo: "거실 공간에 맞춰 선정했습니다",
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const mockItems = [
      {
        id: "item-1",
        package_id: "pkg-1",
        product_id: "prod-1",
        product_name: "BILLY 책장",
        brand_name: "IKEA",
        main_category: "가구",
        sub_category: "수납",
        sale_price: 59900,
        original_price: 79900,
        image_url: "https://example.com/billy.jpg",
        quantity: 1,
        memo: null,
        sort_order: 0,
      },
      {
        id: "item-2",
        package_id: "pkg-1",
        product_id: "prod-2",
        product_name: "AAC 의자",
        brand_name: "HAY",
        main_category: "가구",
        sub_category: "의자",
        sale_price: 349000,
        original_price: 449000,
        image_url: "https://example.com/aac.jpg",
        quantity: 2,
        memo: "색상: 블랙",
        sort_order: 1,
      },
    ];

    // First call: styling_packages
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === "styling_packages") {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({ data: mockPackages, error: null }),
            }),
          }),
        };
      }
      // styling_package_items
      return {
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({ data: mockItems, error: null }),
          }),
        }),
      };
    });

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stylingPackage.getBySubmissionId({
      surveyId: "survey-123",
    });

    expect(result).toHaveLength(1);
    expect(result[0].packageName).toBe("거실 패키지");
    expect(result[0].designerName).toBe("김디자이너");
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[0].productName).toBe("BILLY 책장");
    expect(result[0].items[0].salePrice).toBe(59900);
    expect(result[0].items[1].quantity).toBe(2);
    expect(result[0].items[1].memo).toBe("색상: 블랙");
  });

  it("handles Supabase error gracefully", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({ data: null, error: { message: "Connection error" } }),
        }),
      }),
    }));

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stylingPackage.getBySubmissionId({
      surveyId: "error-case",
    });

    expect(result).toEqual([]);
  });
});

describe("stylingPackage.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when package not found", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { code: "PGRST116" } }),
        }),
      }),
    }));

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stylingPackage.getById({
      packageId: "nonexistent",
    });

    expect(result).toBeNull();
  });

  it("returns package with items when found", async () => {
    const mockPkg = {
      id: "pkg-1",
      survey_id: "survey-123",
      survey_name: "테스트",
      package_name: "침실 패키지",
      styling_type: "full_online",
      designer_name: null,
      memo: null,
      status: "published",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    const mockItems = [
      {
        id: "item-1",
        package_id: "pkg-1",
        product_id: "prod-1",
        product_name: "침대 프레임",
        brand_name: "시몬스",
        main_category: "가구",
        sub_category: "침대",
        sale_price: 890000,
        original_price: 1200000,
        image_url: null,
        quantity: 1,
        memo: null,
        sort_order: 0,
      },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === "styling_packages") {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({ data: mockPkg, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({ data: mockItems, error: null }),
          }),
        }),
      };
    });

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.stylingPackage.getById({
      packageId: "pkg-1",
    });

    expect(result).not.toBeNull();
    expect(result!.packageName).toBe("침실 패키지");
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].productName).toBe("침대 프레임");
    expect(result!.items[0].salePrice).toBe(890000);
  });
});
